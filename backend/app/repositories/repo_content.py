from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.content import Notice, Event, CommitteeMember, GalleryAlbum, GalleryImage, SurnameHistory, AnnualReport, EventRegistration, MemberAnnouncement
from datetime import date, datetime, timezone

class ContentRepository:
    @staticmethod
    async def get_active_member_announcements(db: AsyncSession) -> list[MemberAnnouncement]:
        today = date.today()
        stmt = (
            select(MemberAnnouncement)
            .where(MemberAnnouncement.is_published == True)
            .where(MemberAnnouncement.deleted_at.is_(None))
            .where((MemberAnnouncement.expiry_date.is_(None)) | (MemberAnnouncement.expiry_date >= today))
            .order_by(MemberAnnouncement.display_order.asc(), MemberAnnouncement.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_all_member_announcements(db: AsyncSession) -> list[MemberAnnouncement]:
        stmt = (
            select(MemberAnnouncement)
            .where(MemberAnnouncement.deleted_at.is_(None))
            .order_by(MemberAnnouncement.display_order.asc(), MemberAnnouncement.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_member_announcement_by_id(db: AsyncSession, ann_id: int) -> MemberAnnouncement | None:
        stmt = (
            select(MemberAnnouncement)
            .where(MemberAnnouncement.id == ann_id)
            .where(MemberAnnouncement.deleted_at.is_(None))
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create_member_announcement(db: AsyncSession, **kwargs) -> MemberAnnouncement:
        ann = MemberAnnouncement(**kwargs)
        db.add(ann)
        await db.flush()
        return ann

    @staticmethod
    async def update_member_announcement(db: AsyncSession, ann: MemberAnnouncement, update_data: dict) -> MemberAnnouncement:
        for k, v in update_data.items():
            if v is not None:
                setattr(ann, k, v)
        db.add(ann)
        await db.flush()
        return ann

    @staticmethod
    async def soft_delete_member_announcement(db: AsyncSession, ann: MemberAnnouncement) -> None:
        ann.deleted_at = datetime.now(timezone.utc)
        db.add(ann)
        await db.flush()

    # --- NOTICES REDIRECTS ---
    @staticmethod
    async def get_active_notices(db: AsyncSession) -> list[Notice]:
        """Fetch active notices that are published and not expired or soft-deleted."""
        today = date.today()
        stmt = (
            select(Notice)
            .where(Notice.is_active == True)
            .where(Notice.deleted_at == None)
            .where(Notice.publish_date <= today)
            .where(
                (Notice.expiry_date == None) | (Notice.expiry_date >= today)
            )
            .order_by(Notice.is_pinned.desc(), Notice.publish_date.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_active_notices_count(db: AsyncSession) -> int:
        """Count currently active announcements."""
        today = date.today()
        stmt = (
            select(func.count(Notice.id))
            .where(Notice.is_active == True)
            .where(Notice.deleted_at == None)
            .where(Notice.publish_date <= today)
            .where(
                (Notice.expiry_date == None) | (Notice.expiry_date >= today)
            )
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_latest_notice(db: AsyncSession) -> Notice | None:
        """Fetch the single most recent active notice (pinned first)."""
        today = date.today()
        stmt = (
            select(Notice)
            .where(Notice.is_active == True)
            .where(Notice.deleted_at == None)
            .where(Notice.publish_date <= today)
            .where(
                (Notice.expiry_date == None) | (Notice.expiry_date >= today)
            )
            .order_by(Notice.is_pinned.desc(), Notice.publish_date.desc(), Notice.id.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_notice_by_id(db: AsyncSession, id: int) -> Notice | None:
        """Fetch notice by primary key if not soft-deleted."""
        stmt = select(Notice).where(Notice.id == id).where(Notice.deleted_at == None)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_all_notices_admin(db: AsyncSession) -> list[Notice]:
        """Fetch all notices (including inactive/expired) that are not soft-deleted."""
        stmt = select(Notice).where(Notice.deleted_at == None).order_by(Notice.publish_date.desc(), Notice.id.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_notice(db: AsyncSession, data: dict, author_id: int) -> Notice:
        """Create a new notice record (flush only)."""
        notice = Notice(
            title=data["title"],
            description=data["description"],
            priority=data.get("priority", "medium"),
            publish_date=data["publish_date"],
            expiry_date=data.get("expiry_date"),
            attachment=data.get("attachment"),
            show_on_homepage=data.get("show_on_homepage", True),
            is_pinned=data.get("is_pinned", False),
            is_active=data.get("is_active", True),
            published_by=author_id
        )
        db.add(notice)
        await db.flush()
        return notice

    @staticmethod
    async def update_notice(db: AsyncSession, notice: Notice, data: dict) -> Notice:
        """Update fields on an existing notice (flush only)."""
        for key, val in data.items():
            if val is not None:
                setattr(notice, key, val)
        db.add(notice)
        await db.flush()
        return notice

    @staticmethod
    async def soft_delete_notice(db: AsyncSession, notice: Notice) -> None:
        """Soft-delete a notice (flush only)."""
        notice.deleted_at = datetime.utcnow()
        db.add(notice)
        await db.flush()


    # --- EVENTS ---
    @staticmethod
    async def get_active_events(db: AsyncSession) -> list[Event]:
        """Fetch upcoming events that are published and not soft-deleted."""
        today = date.today()
        stmt = (
            select(Event)
            .where(Event.status == "published")
            .where(Event.deleted_at == None)
            .where(Event.event_date >= today)
            .order_by(Event.event_date.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_active_events_count(db: AsyncSession) -> int:
        """Count upcoming events."""
        today = date.today()
        stmt = (
            select(func.count(Event.id))
            .where(Event.status == "published")
            .where(Event.deleted_at == None)
            .where(Event.event_date >= today)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_next_event(db: AsyncSession) -> Event | None:
        """Fetch the single next upcoming published event."""
        today = date.today()
        stmt = (
            select(Event)
            .where(Event.status == "published")
            .where(Event.deleted_at == None)
            .where(Event.event_date >= today)
            .order_by(Event.event_date.asc(), Event.id.asc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_event_by_id(db: AsyncSession, id: int) -> Event | None:
        """Fetch event by primary key if not soft-deleted."""
        stmt = select(Event).where(Event.id == id).where(Event.deleted_at == None)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_all_events_admin(db: AsyncSession) -> list[Event]:
        """Fetch all events (any status) that are not soft-deleted."""
        stmt = select(Event).where(Event.deleted_at == None).order_by(Event.event_date.desc(), Event.id.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_event(db: AsyncSession, data: dict, creator_id: int) -> Event:
        """Create a new event record (flush only)."""
        event = Event(
            title=data["title"],
            description=data["description"],
            event_date=data["event_date"],
            location=data["location"],
            status=data.get("status", "draft"),
            cover_image=data.get("cover_image"),
            is_featured=data.get("is_featured", False),
            registration_deadline=data.get("registration_deadline"),
            max_capacity=data.get("max_capacity"),
            created_by=creator_id
        )
        db.add(event)
        await db.flush()
        return event

    @staticmethod
    async def update_event(db: AsyncSession, event: Event, data: dict) -> Event:
        """Update fields on an existing event (flush only)."""
        for key, val in data.items():
            if val is not None:
                setattr(event, key, val)
        db.add(event)
        await db.flush()
        return event

    @staticmethod
    async def soft_delete_event(db: AsyncSession, event: Event) -> None:
        """Soft-delete an event (flush only)."""
        event.deleted_at = datetime.utcnow()
        db.add(event)
        await db.flush()


    # --- COMMITTEE MEMBERS ---
    @staticmethod
    async def get_committee_member_by_id(db: AsyncSession, id: int) -> CommitteeMember | None:
        """Fetch active committee member by primary key."""
        stmt = select(CommitteeMember).where(CommitteeMember.id == id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_active_committee_members(db: AsyncSession) -> list[CommitteeMember]:
        """Fetch active committee members ordered by display order."""
        stmt = (
            select(CommitteeMember)
            .where(CommitteeMember.is_active == True)
            .order_by(CommitteeMember.display_order.asc(), CommitteeMember.name.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


    @staticmethod
    async def get_all_committee_members_admin(db: AsyncSession) -> list[CommitteeMember]:
        """Fetch all committee members ordered by display order."""
        stmt = select(CommitteeMember).order_by(CommitteeMember.display_order.asc(), CommitteeMember.name.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_committee_members_count(db: AsyncSession) -> int:
        """Count active committee members."""
        stmt = select(func.count(CommitteeMember.id)).where(CommitteeMember.is_active == True)
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def create_committee_member(db: AsyncSession, data: dict) -> CommitteeMember:
        """Create a new committee member (flush only)."""
        member = CommitteeMember(
            name=data["name"],
            designation=data["designation"],
            phone=data.get("phone"),
            email=data.get("email"),
            term_start=data["term_start"],
            term_end=data.get("term_end"),
            image_url=data.get("image_url"),
            display_order=data.get("display_order", 0),
            is_active=data.get("is_active", True)
        )
        db.add(member)
        await db.flush()
        return member

    @staticmethod
    async def update_committee_member(db: AsyncSession, member: CommitteeMember, data: dict) -> CommitteeMember:
        """Update committee member fields (flush only)."""
        for key, val in data.items():
            if val is not None:
                setattr(member, key, val)
        db.add(member)
        await db.flush()
        return member

    @staticmethod
    async def delete_committee_member(db: AsyncSession, member: CommitteeMember) -> None:
        """Hard delete a committee member (flush only)."""
        await db.delete(member)
        await db.flush()


    # --- GALLERY ALBUMS ---
    @staticmethod
    async def get_album_by_id(db: AsyncSession, id: int) -> GalleryAlbum | None:
        """Fetch album by primary key if not soft-deleted."""
        stmt = (
            select(GalleryAlbum)
            .options(selectinload(GalleryAlbum.images))
            .where(GalleryAlbum.id == id)
            .where(GalleryAlbum.deleted_at == None)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_active_albums(db: AsyncSession) -> list[GalleryAlbum]:
        """Fetch all active gallery albums ordered by display order."""
        stmt = (
            select(GalleryAlbum)
            .where(GalleryAlbum.deleted_at == None)
            .order_by(GalleryAlbum.display_order.asc(), GalleryAlbum.id.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_active_images_by_album_id(db: AsyncSession, album_id: int) -> list[GalleryImage]:
        """Fetch all active images in an album."""
        stmt = (
            select(GalleryImage)
            .where(GalleryImage.album_id == album_id)
            .where(GalleryImage.deleted_at == None)
            .order_by(GalleryImage.id.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


    @staticmethod
    async def get_all_albums_admin(db: AsyncSession) -> list[GalleryAlbum]:
        """Fetch all albums that are not soft-deleted."""
        stmt = select(GalleryAlbum).where(GalleryAlbum.deleted_at == None).order_by(GalleryAlbum.display_order.asc(), GalleryAlbum.id.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_album(db: AsyncSession, data: dict) -> GalleryAlbum:
        """Create a new album record (flush only)."""
        album = GalleryAlbum(
            title=data["title"],
            description=data.get("description"),
            cover_image=data.get("cover_image"),
            display_order=data.get("display_order", 0)
        )
        db.add(album)
        await db.flush()
        return album

    @staticmethod
    async def update_album(db: AsyncSession, album: GalleryAlbum, data: dict) -> GalleryAlbum:
        """Update album fields (flush only)."""
        for key, val in data.items():
            if val is not None:
                setattr(album, key, val)
        db.add(album)
        await db.flush()
        return album

    @staticmethod
    async def soft_delete_album(db: AsyncSession, album: GalleryAlbum) -> None:
        """Soft-delete an album and cascadingly soft-delete its images (flush only)."""
        now = datetime.utcnow()
        album.deleted_at = now
        db.add(album)
        
        # Soft-delete all images in this album
        stmt = select(GalleryImage).where(GalleryImage.album_id == album.id).where(GalleryImage.deleted_at == None)
        res = await db.execute(stmt)
        images = res.scalars().all()
        for img in images:
            img.deleted_at = now
            db.add(img)
            
        await db.flush()


    # --- GALLERY IMAGES ---
    @staticmethod
    async def get_image_by_id(db: AsyncSession, id: int) -> GalleryImage | None:
        """Fetch image by primary key if not soft-deleted."""
        stmt = select(GalleryImage).where(GalleryImage.id == id).where(GalleryImage.deleted_at == None)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_images_count(db: AsyncSession) -> int:
        """Count active gallery images."""
        stmt = select(func.count(GalleryImage.id)).where(GalleryImage.deleted_at == None)
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def create_image(db: AsyncSession, album_id: int, caption: str | None, image_url: str) -> GalleryImage:
        """Create a new image record under an album (flush only)."""
        img = GalleryImage(
            album_id=album_id,
            caption=caption,
            image_url=image_url
        )
        db.add(img)
        await db.flush()
        return img

    @staticmethod
    async def delete_image(db: AsyncSession, image: GalleryImage) -> None:
        """Soft-delete a gallery image (flush only)."""
        image.deleted_at = datetime.utcnow()
        db.add(image)
        await db.flush()


    # --- SURNAMES HISTORY ---
    @staticmethod
    async def get_history_by_id(db: AsyncSession, id: int) -> SurnameHistory | None:
        """Fetch surname history profile by primary key."""
        stmt = select(SurnameHistory).where(SurnameHistory.id == id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_active_histories(db: AsyncSession) -> list[SurnameHistory]:
        """Fetch all surname histories ordered by surname."""
        stmt = select(SurnameHistory).order_by(SurnameHistory.surname.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())


    @staticmethod
    async def get_all_histories_admin(db: AsyncSession) -> list[SurnameHistory]:
        """Fetch all histories ordered by surname."""
        stmt = select(SurnameHistory).order_by(SurnameHistory.surname.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_history(db: AsyncSession, data: dict) -> SurnameHistory:
        """Create surname history record (flush only)."""
        hist = SurnameHistory(
            surname=data["surname"],
            native_region=data["native_region"],
            history=data["history"],
            description=data.get("description")
        )
        db.add(hist)
        await db.flush()
        return hist

    @staticmethod
    async def update_history(db: AsyncSession, history: SurnameHistory, data: dict) -> SurnameHistory:
        """Update surname history details (flush only)."""
        for key, val in data.items():
            if val is not None:
                setattr(history, key, val)
        db.add(history)
        await db.flush()
        return history

    @staticmethod
    async def delete_history(db: AsyncSession, history: SurnameHistory) -> None:
        """Hard delete a surname history record (flush only)."""
        await db.delete(history)
        await db.flush()

    # --- ANNUAL REPORTS ---
    @staticmethod
    async def get_active_reports(db: AsyncSession) -> list[AnnualReport]:
        stmt = (
            select(AnnualReport)
            .where(AnnualReport.is_published == True)
            .where(AnnualReport.deleted_at == None)
            .order_by(AnnualReport.display_order.asc(), AnnualReport.financial_year.desc(), AnnualReport.id.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_all_reports_admin(db: AsyncSession) -> list[AnnualReport]:
        stmt = (
            select(AnnualReport)
            .where(AnnualReport.deleted_at == None)
            .order_by(AnnualReport.display_order.asc(), AnnualReport.financial_year.desc(), AnnualReport.id.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_report_by_id(db: AsyncSession, report_id: int) -> AnnualReport | None:
        stmt = select(AnnualReport).where(AnnualReport.id == report_id, AnnualReport.deleted_at == None)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create_report(db: AsyncSession, data: dict) -> AnnualReport:
        report = AnnualReport(**data)
        db.add(report)
        await db.flush()
        return report

    @staticmethod
    async def update_report(db: AsyncSession, report: AnnualReport, data: dict) -> AnnualReport:
        for key, val in data.items():
            if val is not None:
                setattr(report, key, val)
        db.add(report)
        await db.flush()
        return report

    @staticmethod
    async def delete_report(db: AsyncSession, report: AnnualReport) -> None:
        report.deleted_at = datetime.now(timezone.utc)
        db.add(report)
        await db.flush()

    # --- EVENT REGISTRATIONS ---
    @staticmethod
    async def create_event_registration(db: AsyncSession, data: dict) -> EventRegistration:
        reg = EventRegistration(**data)
        db.add(reg)
        await db.flush()
        return reg

    @staticmethod
    async def get_event_registrations_by_event_id(db: AsyncSession, event_id: int) -> list[EventRegistration]:
        stmt = (
            select(EventRegistration)
            .where(EventRegistration.event_id == event_id)
            .order_by(EventRegistration.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

