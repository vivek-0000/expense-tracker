from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from pydantic import BaseModel
from fastapi import Depends, HTTPException
from auth import get_current_user


router = APIRouter()

# Schema
class ExpenseCreate(BaseModel):
    title: str
    amount: int
    category: str
    date: str

class BudgetCreate(BaseModel):
    month: str
    amount: int

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




# POST → Add expense
@router.post("/expenses")
def add_expense(
    expense: ExpenseCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_expense = models.Expense(
        **expense.dict(),
        user_id=user_id   # ✅ IMPORTANT
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense

@router.get("/expenses")
def get_expenses(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    return db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).all()

@router.delete("/expenses/{id}")
def delete_expense(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == id,
        models.Expense.user_id == user_id
    ).first()

    if not expense:
        raise HTTPException(status_code=404)

    db.delete(expense)
    db.commit()
    return {"message": "Deleted"}

@router.put("/expenses/{id}")
def update_expense(id: int, expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == id).first()

    if not db_expense:
        return {"error": "Expense not found"}

    db_expense.title = expense.title
    db_expense.amount = expense.amount
    db_expense.category = expense.category
    db_expense.date = expense.date

    db.commit()
    db.refresh(db_expense)

    return db_expense

@router.post("/budget")
def set_budget(data: BudgetCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Budget).filter(models.Budget.month == data.month).first()

    if existing:
        existing.amount = data.amount
    else:
        new_budget = models.Budget(month=data.month, amount=data.amount)
        db.add(new_budget)

    db.commit()
    return {"message": "Budget saved"}

@router.get("/budget/{month}")
def get_budget(month: str, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter(models.Budget.month == month).first()

    if not budget:
        return {"amount": 0}

    return {"amount": budget.amount}