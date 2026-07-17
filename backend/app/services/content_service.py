from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.repositories.repo_content import ContentRepository
from app.schemas.content import (
    NoticeResponse, NoticeCreate, NoticeUpdate,
    EventResponse, EventCreate, EventUpdate,
    CommitteeMemberResponse, CommitteeMemberCreate, CommitteeMemberUpdate,
    GalleryAlbumResponse, GalleryAlbumCreate, GalleryAlbumUpdate, GalleryAlbumWithImagesResponse,
    GalleryImageResponse, GalleryImageCreate,
    SurnameHistoryResponse, SurnameHistoryCreate, SurnameHistoryUpdate,
    AnnualReportResponse, AnnualReportCreate, AnnualReportUpdate,
    EventRegistrationResponse, EventRegistrationCreate, EventRegistrationsSummaryResponse,
    MemberAnnouncementCreate, MemberAnnouncementUpdate, MemberAnnouncementResponse
)
from app.exceptions.content import (
    NoticeNotFoundError, EventNotFoundError,
    CommitteeMemberNotFoundError, GalleryAlbumNotFoundError,
    GalleryImageNotFoundError, SurnameHistoryNotFoundError, AnnualReportNotFoundError
)
from app.exceptions.auth import PermissionDeniedError
from app.models.user import User

class ContentService:
    # --- MEMBER ANNOUNCEMENTS ---
    @staticmethod
    async def get_member_announcements(db: AsyncSession) -> List[MemberAnnouncementResponse]:
        """Fetch all active published member announcements."""
        anns = await ContentRepository.get_active_member_announcements(db)
        return [MemberAnnouncementResponse.model_validate(a) for a in anns]

    @staticmethod
    async def get_all_member_announcements_admin(db: AsyncSession) -> List[MemberAnnouncementResponse]:
        anns = await ContentRepository.get_all_member_announcements(db)
        return [MemberAnnouncementResponse.model_validate(a) for a in anns]

    @staticmethod
    async def create_member_announcement_admin(db: AsyncSession, create_data: MemberAnnouncementCreate) -> MemberAnnouncementResponse:
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            ann = await ContentRepository.create_member_announcement(db, **create_data.model_dump())
        if in_tx:
            await db.commit()
        await db.refresh(ann)
        return MemberAnnouncementResponse.model_validate(ann)

    @staticmethod
    async def update_member_announcement_admin(db: AsyncSession, ann_id: int, update_data: MemberAnnouncementUpdate) -> MemberAnnouncementResponse:
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            ann = await ContentRepository.get_member_announcement_by_id(db, ann_id)
            if not ann:
                raise NoticeNotFoundError()
            ann = await ContentRepository.update_member_announcement(db, ann, update_data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
        await db.refresh(ann)
        return MemberAnnouncementResponse.model_validate(ann)

    @staticmethod
    async def delete_member_announcement_admin(db: AsyncSession, ann_id: int) -> None:
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            ann = await ContentRepository.get_member_announcement_by_id(db, ann_id)
            if not ann:
                raise NoticeNotFoundError()
            await ContentRepository.soft_delete_member_announcement(db, ann)
        if in_tx:
            await db.commit()

    # --- MEMBER / PUBLIC ANNOUNCEMENTS ---
    @staticmethod
    async def get_notices(db: AsyncSession) -> List[NoticeResponse]:
        """Fetch all active announcements."""
        notices = await ContentRepository.get_active_notices(db)
        return [NoticeResponse.model_validate(n) for n in notices]

    @staticmethod
    async def get_events(db: AsyncSession) -> List[EventResponse]:
        """Fetch all published upcoming events."""
        events = await ContentRepository.get_active_events(db)
        return [EventResponse.model_validate(e) for e in events]

    @staticmethod
    async def get_active_committee_members(db: AsyncSession) -> List[CommitteeMemberResponse]:
        """Fetch all active committee members (Public)."""
        members = await ContentRepository.get_active_committee_members(db)
        return [CommitteeMemberResponse.model_validate(m) for m in members]

    @staticmethod
    async def get_active_albums(db: AsyncSession) -> List[GalleryAlbumResponse]:
        """Fetch all active albums (Public)."""
        albums = await ContentRepository.get_active_albums(db)
        return [GalleryAlbumResponse.model_validate(a) for a in albums]

    @staticmethod
    async def get_album_with_images(db: AsyncSession, album_id: int) -> GalleryAlbumWithImagesResponse:
        """Fetch a single album along with all active images in it (Public)."""
        album = await ContentRepository.get_album_by_id(db, album_id)
        if not album:
            raise GalleryAlbumNotFoundError()
        images = await ContentRepository.get_active_images_by_album_id(db, album_id)
        
        # Build the response model manually or validate
        response_data = GalleryAlbumWithImagesResponse.model_validate(album)
        response_data.images = [GalleryImageResponse.model_validate(img) for img in images]
        return response_data

    @staticmethod
    async def get_surname_histories(db: AsyncSession) -> List[SurnameHistoryResponse]:
        """Fetch all surname history profiles (Public)."""
        histories = await ContentRepository.get_active_histories(db)
        return [SurnameHistoryResponse.model_validate(h) for h in histories]

    @staticmethod
    async def get_surname_history_by_id(db: AsyncSession, history_id: int) -> SurnameHistoryResponse:
        """Fetch a specific surname history profile by ID (Public)."""
        history = await ContentRepository.get_history_by_id(db, history_id)
        if not history:
            raise SurnameHistoryNotFoundError()
        return SurnameHistoryResponse.model_validate(history)

    @staticmethod
    async def get_active_reports(db: AsyncSession) -> List[AnnualReportResponse]:
        """Fetch all active published annual reports (Public/Member)."""
        reports = await ContentRepository.get_active_reports(db)
        return [AnnualReportResponse.model_validate(r) for r in reports]




    # --- ADMIN NOTICE CRUD ---
    @staticmethod
    async def get_all_notices_admin(db: AsyncSession, current_user: User) -> List[NoticeResponse]:
        """Fetch all notices including draft/expired ones (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
        notices = await ContentRepository.get_all_notices_admin(db)
        return [NoticeResponse.model_validate(n) for n in notices]

    @staticmethod
    async def create_notice(db: AsyncSession, current_user: User, data: NoticeCreate) -> NoticeResponse:
        """Create a new notice record (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            notice = await ContentRepository.create_notice(db, data.model_dump(), current_user.id)
        if in_tx:
            await db.commit()
        return NoticeResponse.model_validate(notice)

    @staticmethod
    async def update_notice(db: AsyncSession, current_user: User, id: int, data: NoticeUpdate) -> NoticeResponse:
        """Update fields on an existing notice (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            notice = await ContentRepository.get_notice_by_id(db, id)
            if not notice:
                raise NoticeNotFoundError()
            await ContentRepository.update_notice(db, notice, data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
            
        notice_ref = await ContentRepository.get_notice_by_id(db, id)
        return NoticeResponse.model_validate(notice_ref)

    @staticmethod
    async def delete_notice(db: AsyncSession, current_user: User, id: int) -> None:
        """Soft-delete a notice (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            notice = await ContentRepository.get_notice_by_id(db, id)
            if not notice:
                raise NoticeNotFoundError()
            await ContentRepository.soft_delete_notice(db, notice)
        if in_tx:
            await db.commit()


    # --- ADMIN EVENT CRUD ---
    @staticmethod
    async def get_all_events_admin(db: AsyncSession, current_user: User) -> List[EventResponse]:
        """Fetch all events across the platform (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
        events = await ContentRepository.get_all_events_admin(db)
        return [EventResponse.model_validate(e) for e in events]

    @staticmethod
    async def create_event(db: AsyncSession, current_user: User, data: EventCreate) -> EventResponse:
        """Create a new event record (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            event = await ContentRepository.create_event(db, data.model_dump(), current_user.id)
        if in_tx:
            await db.commit()
        return EventResponse.model_validate(event)

    @staticmethod
    async def update_event(db: AsyncSession, current_user: User, id: int, data: EventUpdate) -> EventResponse:
        """Update fields on an existing event (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            event = await ContentRepository.get_event_by_id(db, id)
            if not event:
                raise EventNotFoundError()
            await ContentRepository.update_event(db, event, data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
            
        event_ref = await ContentRepository.get_event_by_id(db, id)
        return EventResponse.model_validate(event_ref)

    @staticmethod
    async def delete_event(db: AsyncSession, current_user: User, id: int) -> None:
        """Soft-delete an event (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            event = await ContentRepository.get_event_by_id(db, id)
            if not event:
                raise EventNotFoundError()
            await ContentRepository.soft_delete_event(db, event)
        if in_tx:
            await db.commit()


    # --- ADMIN COMMITTEE CRUD ---
    @staticmethod
    async def get_all_committee_members_admin(db: AsyncSession, current_user: User) -> List[CommitteeMemberResponse]:
        """Fetch all committee members including active and inactive (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
        members = await ContentRepository.get_all_committee_members_admin(db)
        return [CommitteeMemberResponse.model_validate(m) for m in members]

    @staticmethod
    async def create_committee_member(db: AsyncSession, current_user: User, data: CommitteeMemberCreate) -> CommitteeMemberResponse:
        """Create a new committee member (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            member = await ContentRepository.create_committee_member(db, data.model_dump())
        if in_tx:
            await db.commit()
        return CommitteeMemberResponse.model_validate(member)

    @staticmethod
    async def update_committee_member(db: AsyncSession, current_user: User, id: int, data: CommitteeMemberUpdate) -> CommitteeMemberResponse:
        """Update fields on a committee member (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            member = await ContentRepository.get_committee_member_by_id(db, id)
            if not member:
                raise CommitteeMemberNotFoundError()
            await ContentRepository.update_committee_member(db, member, data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
            
        member_ref = await ContentRepository.get_committee_member_by_id(db, id)
        return CommitteeMemberResponse.model_validate(member_ref)

    @staticmethod
    async def delete_committee_member(db: AsyncSession, current_user: User, id: int) -> None:
        """Hard delete a committee member (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            member = await ContentRepository.get_committee_member_by_id(db, id)
            if not member:
                raise CommitteeMemberNotFoundError()
            await ContentRepository.delete_committee_member(db, member)
        if in_tx:
            await db.commit()


    # --- ADMIN GALLERY CRUD ---
    @staticmethod
    async def get_all_albums_admin(db: AsyncSession, current_user: User) -> List[GalleryAlbumResponse]:
        """Fetch all albums (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
        albums = await ContentRepository.get_all_albums_admin(db)
        return [GalleryAlbumResponse.model_validate(a) for a in albums]

    @staticmethod
    async def create_gallery_album(db: AsyncSession, current_user: User, data: GalleryAlbumCreate) -> GalleryAlbumResponse:
        """Create a new gallery album (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            album = await ContentRepository.create_album(db, data.model_dump())
        if in_tx:
            await db.commit()
        return GalleryAlbumResponse.model_validate(album)

    @staticmethod
    async def update_gallery_album(db: AsyncSession, current_user: User, id: int, data: GalleryAlbumUpdate) -> GalleryAlbumResponse:
        """Update fields on a gallery album (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            album = await ContentRepository.get_album_by_id(db, id)
            if not album:
                raise GalleryAlbumNotFoundError()
            await ContentRepository.update_album(db, album, data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
            
        album_ref = await ContentRepository.get_album_by_id(db, id)
        return GalleryAlbumResponse.model_validate(album_ref)

    @staticmethod
    async def delete_gallery_album(db: AsyncSession, current_user: User, id: int) -> None:
        """Soft-delete an album and cascadingly soft-delete its images (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            album = await ContentRepository.get_album_by_id(db, id)
            if not album:
                raise GalleryAlbumNotFoundError()
            await ContentRepository.soft_delete_album(db, album)
        if in_tx:
            await db.commit()

    @staticmethod
    async def add_gallery_image(db: AsyncSession, current_user: User, album_id: int, data: GalleryImageCreate) -> GalleryImageResponse:
        """Upload and add a gallery image under an album (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            album = await ContentRepository.get_album_by_id(db, album_id)
            if not album:
                raise GalleryAlbumNotFoundError()
            image = await ContentRepository.create_image(db, album_id, data.caption, data.image_url)
        if in_tx:
            await db.commit()
        return GalleryImageResponse.model_validate(image)

    @staticmethod
    async def delete_gallery_image(db: AsyncSession, current_user: User, image_id: int) -> None:
        """Soft-delete a gallery image (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            image = await ContentRepository.get_image_by_id(db, image_id)
            if not image:
                raise GalleryImageNotFoundError()
            await ContentRepository.delete_image(db, image)
        if in_tx:
            await db.commit()


    # --- ADMIN SURNAME HISTORY CRUD ---
    @staticmethod
    async def get_all_histories_admin(db: AsyncSession, current_user: User) -> List[SurnameHistoryResponse]:
        """Fetch all surname histories (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
        histories = await ContentRepository.get_all_histories_admin(db)
        return [SurnameHistoryResponse.model_validate(h) for h in histories]

    @staticmethod
    async def create_surname_history(db: AsyncSession, current_user: User, data: SurnameHistoryCreate) -> SurnameHistoryResponse:
        """Create surname history record (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            history = await ContentRepository.create_history(db, data.model_dump())
        if in_tx:
            await db.commit()
        return SurnameHistoryResponse.model_validate(history)

    @staticmethod
    async def update_surname_history(db: AsyncSession, current_user: User, id: int, data: SurnameHistoryUpdate) -> SurnameHistoryResponse:
        """Update fields on a surname history record (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            history = await ContentRepository.get_history_by_id(db, id)
            if not history:
                raise SurnameHistoryNotFoundError()
            await ContentRepository.update_history(db, history, data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
            
        history_ref = await ContentRepository.get_history_by_id(db, id)
        return SurnameHistoryResponse.model_validate(history_ref)

    @staticmethod
    async def delete_surname_history(db: AsyncSession, current_user: User, id: int) -> None:
        """Hard delete a surname history record (Admin only)."""
        if current_user.role != "admin":
            raise PermissionDeniedError()
            
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            history = await ContentRepository.get_history_by_id(db, id)
            if not history:
                raise SurnameHistoryNotFoundError()
            await ContentRepository.delete_history(db, history)
        if in_tx:
            await db.commit()

    # --- ANNUAL REPORT CRUD (ADMIN) ---
    @staticmethod
    async def get_all_reports_admin(db: AsyncSession, current_user: User) -> List[AnnualReportResponse]:
        if current_user.role != "admin":
            raise PermissionDeniedError()
        reports = await ContentRepository.get_all_reports_admin(db)
        return [AnnualReportResponse.model_validate(r) for r in reports]

    @staticmethod
    async def create_report(db: AsyncSession, current_user: User, data: AnnualReportCreate) -> AnnualReportResponse:
        if current_user.role != "admin":
            raise PermissionDeniedError()
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            report = await ContentRepository.create_report(db, data.model_dump())
        if in_tx:
            await db.commit()
        return AnnualReportResponse.model_validate(report)

    @staticmethod
    async def update_report(db: AsyncSession, current_user: User, id: int, data: AnnualReportUpdate) -> AnnualReportResponse:
        if current_user.role != "admin":
            raise PermissionDeniedError()
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            report = await ContentRepository.get_report_by_id(db, id)
            if not report:
                raise AnnualReportNotFoundError()
            await ContentRepository.update_report(db, report, data.model_dump(exclude_unset=True))
        if in_tx:
            await db.commit()
        report_ref = await ContentRepository.get_report_by_id(db, id)
        return AnnualReportResponse.model_validate(report_ref)

    @staticmethod
    async def delete_report(db: AsyncSession, current_user: User, id: int) -> None:
        if current_user.role != "admin":
            raise PermissionDeniedError()
        in_tx = db.in_transaction()
        async with (db.begin_nested() if in_tx else db.begin()):
            report = await ContentRepository.get_report_by_id(db, id)
            if not report:
                raise AnnualReportNotFoundError()
            await ContentRepository.delete_report(db, report)
        if in_tx:
            await db.commit()

    # --- EVENT REGISTRATIONS ---
    @staticmethod
    async def register_for_event(db: AsyncSession, event_id: int, data: EventRegistrationCreate, current_user: Optional[User] = None) -> EventRegistrationResponse:
        event = await ContentRepository.get_event_by_id(db, event_id)
        if not event:
            raise EventNotFoundError()
        in_tx = db.in_transaction()
        reg_data = data.model_dump()
        reg_data["event_id"] = event_id
        if current_user:
            reg_data["user_id"] = current_user.id
        async with (db.begin_nested() if in_tx else db.begin()):
            reg = await ContentRepository.create_event_registration(db, reg_data)
        if in_tx:
            await db.commit()
        return EventRegistrationResponse.model_validate(reg)

    @staticmethod
    async def get_event_registrations_admin(db: AsyncSession, current_user: User, event_id: int) -> EventRegistrationsSummaryResponse:
        if current_user.role != "admin":
            raise PermissionDeniedError()
        event = await ContentRepository.get_event_by_id(db, event_id)
        if not event:
            raise EventNotFoundError()
        regs = await ContentRepository.get_event_registrations_by_event_id(db, event_id)
        total_regs = len(regs)
        total_attendees = sum(r.member_count for r in regs)
        return EventRegistrationsSummaryResponse(
            total_registrations=total_regs,
            total_expected_attendees=total_attendees,
            registrations=[EventRegistrationResponse.model_validate(r) for r in regs]
        )

