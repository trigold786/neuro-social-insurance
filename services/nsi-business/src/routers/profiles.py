from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..schemas import ProfileCreateRequest, ProfilePatchRequest, ProfileCreateResponse, ProfileOut
from ..services import profile_service
from ..dependencies import get_current_identity_id

router = APIRouter()

@router.post("", response_model=ProfileCreateResponse)
async def create_profile(
    req: ProfileCreateRequest,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    try:
        result = await profile_service.create_profile(db, identity_id, req)
        await db.commit()
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/me", response_model=ProfileOut)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    profile = await profile_service.get_profile_by_identity(db, identity_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile

@router.patch("/me", response_model=ProfileOut)
async def patch_profile(
    req: ProfilePatchRequest,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    try:
        result = await profile_service.patch_profile(db, identity_id, req)
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
