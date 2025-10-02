from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="TodoList API")

# CORS 설정 - 프론트엔드에서 API 호출 가능하도록
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포시에는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# 데이터 모델 정의
class TodoItem(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = ""
    completed: bool = False
    created_at: Optional[str] = None
    category: Optional[str] = "기본"

class Category(BaseModel):
    id: Optional[int] = None
    name: str
    color: Optional[str] = "#3B82F6"
    created_at: Optional[str] = None

# 메모리 내 데이터베이스 (실제로는 PostgreSQL, MongoDB 등 사용)
todos_db: List[TodoItem] = []
categories_db: List[Category] = []
next_id = 1
next_category_id = 1

# 기본 카테고리 초기화
default_categories = [
    {"name": "기본", "color": "#3B82F6"},
    {"name": "업무", "color": "#EF4444"},
    {"name": "개인", "color": "#10B981"},
    {"name": "쇼핑", "color": "#F59E0B"},
    {"name": "학습", "color": "#8B5CF6"}
]

for cat_data in default_categories:
    category = Category(
        id=next_category_id,
        name=cat_data["name"],
        color=cat_data["color"],
        created_at=datetime.now().isoformat()
    )
    categories_db.append(category)
    next_category_id += 1

@app.get("/")
async def read_root():
    """API 루트 엔드포인트"""
    return {"message": "TodoList API에 오신 것을 환영합니다!", "docs": "/docs"}

@app.get("/api/todos", response_model=List[TodoItem])
async def get_todos():
    """모든 할 일 목록 조회"""
    return todos_db

@app.get("/api/todos/{todo_id}", response_model=TodoItem)
async def get_todo(todo_id: int):
    """특정 할 일 조회"""
    for todo in todos_db:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")

@app.post("/api/todos", response_model=TodoItem)
async def create_todo(todo: TodoItem):
    """새로운 할 일 생성"""
    global next_id
    todo.id = next_id
    todo.created_at = datetime.now().isoformat()
    todos_db.append(todo)
    next_id += 1
    return todo

@app.put("/api/todos/{todo_id}", response_model=TodoItem)
async def update_todo(todo_id: int, updated_todo: TodoItem):
    """할 일 수정"""
    for index, todo in enumerate(todos_db):
        if todo.id == todo_id:
            updated_todo.id = todo_id
            updated_todo.created_at = todo.created_at
            todos_db[index] = updated_todo
            return updated_todo
    raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")

@app.patch("/api/todos/{todo_id}/toggle", response_model=TodoItem)
async def toggle_todo(todo_id: int):
    """할 일 완료 상태 토글"""
    for todo in todos_db:
        if todo.id == todo_id:
            todo.completed = not todo.completed
            return todo
    raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: int):
    """할 일 삭제"""
    global todos_db
    for index, todo in enumerate(todos_db):
        if todo.id == todo_id:
            deleted_todo = todos_db.pop(index)
            return {"message": "할 일이 삭제되었습니다.", "deleted": deleted_todo}
    raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")

@app.delete("/api/todos")
async def delete_all_todos():
    """모든 할 일 삭제"""
    global todos_db, next_id
    count = len(todos_db)
    todos_db = []
    next_id = 1
    return {"message": f"{count}개의 할 일이 모두 삭제되었습니다."}

# 카테고리 관리 API
@app.get("/api/categories", response_model=List[Category])
async def get_categories():
    """모든 카테고리 조회"""
    return categories_db

@app.post("/api/categories", response_model=Category)
async def create_category(category: Category):
    """새로운 카테고리 생성"""
    global next_category_id
    category.id = next_category_id
    category.created_at = datetime.now().isoformat()
    categories_db.append(category)
    next_category_id += 1
    return category

@app.get("/api/todos/category/{category_name}", response_model=List[TodoItem])
async def get_todos_by_category(category_name: str):
    """특정 카테고리의 할 일 목록 조회"""
    return [todo for todo in todos_db if todo.category == category_name]

@app.get("/api/todos/category/{category_name}/stats")
async def get_category_stats(category_name: str):
    """카테고리별 통계"""
    category_todos = [todo for todo in todos_db if todo.category == category_name]
    total = len(category_todos)
    completed = len([todo for todo in category_todos if todo.completed])
    active = total - completed
    
    return {
        "category": category_name,
        "total": total,
        "completed": completed,
        "active": active,
        "completion_rate": round((completed / total * 100) if total > 0 else 0, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

