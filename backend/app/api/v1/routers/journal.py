from fastapi import APIRouter, Depends

from app.core.responses import success_response
from app.models.status import HTTPStatus
from app.models.apiError import ApiError
from app.schemas.journal import JournalCreate, JournalUpdate
from app.services.journal_service import journal_service
from app.dependencies import get_current_user


router = APIRouter(tags=["journal"])


# ✅ CREATE
@router.post("/")
async def create_entry(
    journal_in: JournalCreate,
    current_user=Depends(get_current_user)
):
    new_entry = await journal_service.create_journal(
        current_user.id,
        journal_in
    )

    return success_response(
        message="Saved",
        data=new_entry,
        status_code=HTTPStatus.CREATED
    )


# ✅ GET ALL
@router.get("/")
async def get_entries(
    current_user=Depends(get_current_user),
    limit: int = 50,
    skip: int = 0
):
    entries, total = await journal_service.get_user_journals(
        str(current_user.id),
        limit,
        skip
    )

    return success_response(
        data={
            "entries": entries,
            "total": total
        }
    )


# ✅ GET SINGLE
@router.get("/{journal_id}")
async def get_single_entry(
    journal_id: str,
    current_user=Depends(get_current_user)
):
    entry = await journal_service.get_journal_by_id(
        journal_id,
        current_user.id
    )

    if not entry:
        raise ApiError(
            status_code=HTTPStatus.NOT_FOUND,
            message="Entry not found"
        )

    return success_response(data=entry)


# ✅ UPDATE
@router.patch("/{journal_id}")
async def update_entry(
    journal_id: str,
    journal_in: JournalUpdate,
    current_user=Depends(get_current_user)
):
    updated_entry = await journal_service.update_journal(
        journal_id,
        current_user.id,
        journal_in
    )

    if not updated_entry:
        raise ApiError(
            status_code=HTTPStatus.NOT_FOUND,
            message="Entry not found or nothing to update"
        )

    return success_response(
        message="Updated successfully",
        data=updated_entry
    )


# ✅ DELETE
@router.delete("/{journal_id}")
async def delete_entry(
    journal_id: str,
    current_user=Depends(get_current_user)
):
    deleted = await journal_service.delete_journal(
        journal_id,
        current_user.id
    )

    if not deleted:
        raise ApiError(
            status_code=HTTPStatus.NOT_FOUND,
            message="Entry not found"
        )

    return success_response(message="Deleted")