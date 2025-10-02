from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

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
    completed_at: Optional[str] = None
    category: Optional[str] = "기본"
    priority: Optional[str] = "보통"  # 높음, 보통, 낮음
    due_date: Optional[str] = None  # YYYY-MM-DD 형식

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
            if todo.completed:
                todo.completed_at = datetime.now().isoformat()
            else:
                todo.completed_at = None
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

# 고급 통계 API
@app.get("/api/stats/overview")
async def get_overview_stats():
    """전체 통계 개요"""
    total_todos = len(todos_db)
    completed_todos = len([todo for todo in todos_db if todo.completed])
    active_todos = total_todos - completed_todos
    
    # 카테고리별 통계
    category_stats = {}
    for category in categories_db:
        category_todos = [todo for todo in todos_db if todo.category == category.name]
        category_completed = len([todo for todo in category_todos if todo.completed])
        category_stats[category.name] = {
            "total": len(category_todos),
            "completed": category_completed,
            "completion_rate": round((category_completed / len(category_todos) * 100) if len(category_todos) > 0 else 0, 1)
        }
    
    return {
        "total_todos": total_todos,
        "completed_todos": completed_todos,
        "active_todos": active_todos,
        "overall_completion_rate": round((completed_todos / total_todos * 100) if total_todos > 0 else 0, 1),
        "category_stats": category_stats
    }

@app.get("/api/stats/daily")
async def get_daily_stats(days: int = 7):
    """일별 완료 통계"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    daily_stats = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        
        # 해당 날짜에 완료된 할 일들
        completed_today = [
            todo for todo in todos_db 
            if todo.completed and todo.completed_at and 
            todo.completed_at.startswith(date_str)
        ]
        
        # 해당 날짜에 생성된 할 일들
        created_today = [
            todo for todo in todos_db 
            if todo.created_at and todo.created_at.startswith(date_str)
        ]
        
        daily_stats.append({
            "date": date_str,
            "completed": len(completed_today),
            "created": len(created_today),
            "completion_rate": round((len(completed_today) / len(created_today) * 100) if len(created_today) > 0 else 0, 1)
        })
    
    return daily_stats

@app.get("/api/stats/weekly")
async def get_weekly_stats(weeks: int = 4):
    """주별 완료 통계"""
    weekly_stats = []
    for i in range(weeks):
        week_start = datetime.now() - timedelta(weeks=i+1)
        week_end = datetime.now() - timedelta(weeks=i)
        
        # 해당 주에 완료된 할 일들
        completed_this_week = [
            todo for todo in todos_db 
            if todo.completed and todo.completed_at and 
            week_start <= datetime.fromisoformat(todo.completed_at.replace('Z', '+00:00')) < week_end
        ]
        
        # 해당 주에 생성된 할 일들
        created_this_week = [
            todo for todo in todos_db 
            if todo.created_at and 
            week_start <= datetime.fromisoformat(todo.created_at.replace('Z', '+00:00')) < week_end
        ]
        
        weekly_stats.append({
            "week": f"{week_start.strftime('%m/%d')} - {week_end.strftime('%m/%d')}",
            "completed": len(completed_this_week),
            "created": len(created_this_week),
            "completion_rate": round((len(completed_this_week) / len(created_this_week) * 100) if len(created_this_week) > 0 else 0, 1)
        })
    
    return weekly_stats

@app.get("/api/stats/completion-time")
async def get_completion_time_stats():
    """완료 시간 분석"""
    completed_todos = [todo for todo in todos_db if todo.completed and todo.completed_at and todo.created_at]
    
    completion_times = []
    for todo in completed_todos:
        created_time = datetime.fromisoformat(todo.created_at.replace('Z', '+00:00'))
        completed_time = datetime.fromisoformat(todo.completed_at.replace('Z', '+00:00'))
        time_diff = completed_time - created_time
        
        completion_times.append({
            "todo_id": todo.id,
            "title": todo.title,
            "category": todo.category,
            "completion_hours": round(time_diff.total_seconds() / 3600, 1),
            "completion_days": round(time_diff.total_seconds() / 86400, 1)
        })
    
    if not completion_times:
        return {"message": "완료된 할 일이 없습니다."}
    
    # 평균 완료 시간 계산
    avg_completion_hours = sum(ct["completion_hours"] for ct in completion_times) / len(completion_times)
    avg_completion_days = sum(ct["completion_days"] for ct in completion_times) / len(completion_times)
    
    # 카테고리별 평균 완료 시간
    category_completion_times = {}
    for category in categories_db:
        category_times = [ct for ct in completion_times if ct["category"] == category.name]
        if category_times:
            category_completion_times[category.name] = {
                "avg_hours": round(sum(ct["completion_hours"] for ct in category_times) / len(category_times), 1),
                "avg_days": round(sum(ct["completion_days"] for ct in category_times) / len(category_times), 1),
                "count": len(category_times)
            }
    
    return {
        "total_completed": len(completion_times),
        "avg_completion_hours": round(avg_completion_hours, 1),
        "avg_completion_days": round(avg_completion_days, 1),
        "category_completion_times": category_completion_times,
        "completion_details": completion_times
    }

@app.get("/api/stats/productivity")
async def get_productivity_stats():
    """생산성 분석"""
    # 최근 30일 데이터
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    recent_todos = [
        todo for todo in todos_db 
        if todo.created_at and 
        datetime.fromisoformat(todo.created_at.replace('Z', '+00:00')) >= thirty_days_ago
    ]
    
    recent_completed = [
        todo for todo in recent_todos 
        if todo.completed and todo.completed_at and
        datetime.fromisoformat(todo.completed_at.replace('Z', '+00:00')) >= thirty_days_ago
    ]
    
    # 일별 생산성
    daily_productivity = []
    for i in range(30):
        current_date = thirty_days_ago + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        
        created_today = len([
            todo for todo in recent_todos 
            if todo.created_at and todo.created_at.startswith(date_str)
        ])
        
        completed_today = len([
            todo for todo in recent_completed 
            if todo.completed_at and todo.completed_at.startswith(date_str)
        ])
        
        daily_productivity.append({
            "date": date_str,
            "created": created_today,
            "completed": completed_today,
            "net_productivity": completed_today - created_today
        })
    
    # 전체 생산성 지표
    total_created = len(recent_todos)
    total_completed = len(recent_completed)
    productivity_rate = round((total_completed / total_created * 100) if total_created > 0 else 0, 1)
    
    return {
        "period": "최근 30일",
        "total_created": total_created,
        "total_completed": total_completed,
        "productivity_rate": productivity_rate,
        "daily_productivity": daily_productivity
    }

# 우선순위 및 마감일 관리 API
@app.get("/api/sort-todos")
async def get_todos_sorted(sort_by: str = "priority"):
    """우선순위별 또는 마감일별 정렬된 할 일 목록"""
    sorted_todos = todos_db.copy()
    
    if sort_by == "priority":
        priority_order = {"높음": 1, "보통": 2, "낮음": 3}
        sorted_todos.sort(key=lambda x: (
            priority_order.get(x.priority, 2),  # 우선순위
            x.due_date or "9999-12-31"  # 마감일 (없으면 마지막)
        ))
    elif sort_by == "due_date":
        sorted_todos.sort(key=lambda x: (
            x.due_date or "9999-12-31",  # 마감일
            {"높음": 1, "보통": 2, "낮음": 3}.get(x.priority, 2)  # 우선순위
        ))
    elif sort_by == "created":
        sorted_todos.sort(key=lambda x: x.created_at or "", reverse=True)
    
    return sorted_todos

@app.get("/api/todos/urgent")
async def get_urgent_todos():
    """마감일이 임박한 할 일 목록 (3일 이내)"""
    today = datetime.now().date()
    urgent_todos = []
    
    for todo in todos_db:
        if todo.due_date and not todo.completed:
            due_date = datetime.strptime(todo.due_date, "%Y-%m-%d").date()
            days_until_due = (due_date - today).days
            
            if 0 <= days_until_due <= 3:  # 3일 이내
                urgent_todos.append({
                    **todo.dict(),
                    "days_until_due": days_until_due,
                    "is_overdue": days_until_due < 0
                })
    
    # 마감일 순으로 정렬
    urgent_todos.sort(key=lambda x: x["due_date"])
    return urgent_todos

@app.get("/api/todos/priority/{priority}")
async def get_todos_by_priority(priority: str):
    """특정 우선순위의 할 일 목록"""
    if priority not in ["높음", "보통", "낮음"]:
        raise HTTPException(status_code=400, detail="유효하지 않은 우선순위입니다.")
    
    return [todo for todo in todos_db if todo.priority == priority]

@app.get("/api/todos/overdue")
async def get_overdue_todos():
    """마감일이 지난 미완료 할 일 목록"""
    today = datetime.now().date()
    overdue_todos = []
    
    for todo in todos_db:
        if todo.due_date and not todo.completed:
            due_date = datetime.strptime(todo.due_date, "%Y-%m-%d").date()
            if due_date < today:
                days_overdue = (today - due_date).days
                overdue_todos.append({
                    **todo.dict(),
                    "days_overdue": days_overdue
                })
    
    # 지난 일수 순으로 정렬
    overdue_todos.sort(key=lambda x: x["days_overdue"], reverse=True)
    return overdue_todos

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

