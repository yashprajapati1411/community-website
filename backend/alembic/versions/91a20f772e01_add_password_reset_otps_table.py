"""add password reset otps table

Revision ID: 91a20f772e01
Revises: 02f568092e61
Create Date: 2026-07-08 15:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '91a20f772e01'
down_revision = '02f568092e61'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'password_reset_otps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('mobile', sa.String(length=20), nullable=False),
        sa.Column('hashed_otp', sa.String(length=128), nullable=False),
        sa.Column('reset_token', sa.String(length=128), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_used', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_password_reset_otps_user_id'), 'password_reset_otps', ['user_id'], unique=False)
    op.create_index(op.f('ix_password_reset_otps_mobile'), 'password_reset_otps', ['mobile'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_password_reset_otps_mobile'), table_name='password_reset_otps')
    op.drop_index(op.f('ix_password_reset_otps_user_id'), table_name='password_reset_otps')
    op.drop_table('password_reset_otps')
