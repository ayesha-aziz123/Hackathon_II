# Skill: migration_builder

## Purpose
Generate Alembic database migration scripts for schema changes.

## Inputs
- SQLModel models
- Migration description
- Change type (create, alter, drop)
- Previous migration revision (if any)

## Process

### Step 1: Initialize Alembic (First Time Only)

```bash
# Create alembic directory structure
alembic init alembic
```

### Step 2: Configure Alembic

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import all models
from backend.database.models import SQLModel
from backend.database.connection import DATABASE_URL

config = context.config
config.set_main_option("sqlalchemy.url", DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Step 3: Generate Migration Template

```python
# alembic/versions/{revision}_description.py
"""
{description}

Revision ID: {revision}
Revises: {previous_revision}
Create Date: {timestamp}
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '{new_revision}'
down_revision = '{previous_revision}'  # or None for first migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply migration changes."""
    # Migration code here
    pass


def downgrade() -> None:
    """Revert migration changes."""
    # Rollback code here
    pass
```

### Step 4: Create Table Migration

```python
def upgrade() -> None:
    """Create tables."""

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(
        op.f('ix_tasks_user_id'),
        'tasks',
        ['user_id'],
        unique=False
    )

    op.create_index(
        op.f('ix_tasks_completed'),
        'tasks',
        ['completed'],
        unique=False
    )


def downgrade() -> None:
    """Drop tables."""
    op.drop_index(op.f('ix_tasks_completed'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
    op.drop_table('tasks')
```

### Step 5: Alter Table Migration

```python
def upgrade() -> None:
    """Add new column."""
    op.add_column(
        'tasks',
        sa.Column('priority', sa.Integer(), nullable=True, server_default='0')
    )

    op.create_index(
        op.f('ix_tasks_priority'),
        'tasks',
        ['priority'],
        unique=False
    )


def downgrade() -> None:
    """Remove column."""
    op.drop_index(op.f('ix_tasks_priority'), table_name='tasks')
    op.drop_column('tasks', 'priority')
```

## Complete Example: Initial Schema Migration

```python
# alembic/versions/001_initial_schema.py
"""
Initial database schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-01-15 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema."""

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_tasks'))
    )
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
    op.create_index(op.f('ix_tasks_completed'), 'tasks', ['completed'], unique=False)

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_conversations'))
    )
    op.create_index(
        op.f('ix_conversations_user_id'),
        'conversations',
        ['user_id'],
        unique=False
    )

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ['conversation_id'],
            ['conversations.id'],
            name=op.f('fk_messages_conversation_id_conversations'),
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_messages'))
    )
    op.create_index(
        op.f('ix_messages_user_id'),
        'messages',
        ['user_id'],
        unique=False
    )
    op.create_index(
        op.f('ix_messages_conversation_id'),
        'messages',
        ['conversation_id'],
        unique=False
    )


def downgrade() -> None:
    """Drop all tables."""

    # Drop messages table (has foreign key to conversations)
    op.drop_index(op.f('ix_messages_conversation_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_user_id'), table_name='messages')
    op.drop_table('messages')

    # Drop conversations table
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_table('conversations')

    # Drop tasks table
    op.drop_index(op.f('ix_tasks_completed'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
    op.drop_table('tasks')
```

## Migration Configuration File

```ini
# alembic.ini
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = sqlite:///./todo.db

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

## Common Migration Operations

### Add Column
```python
op.add_column('table_name', sa.Column('column_name', sa.String(50)))
```

### Drop Column
```python
op.drop_column('table_name', 'column_name')
```

### Rename Column
```python
op.alter_column('table_name', 'old_name', new_column_name='new_name')
```

### Modify Column Type
```python
op.alter_column('table_name', 'column_name', type_=sa.String(100))
```

### Add Index
```python
op.create_index('ix_table_column', 'table_name', ['column_name'])
```

### Add Foreign Key
```python
op.create_foreign_key(
    'fk_table_column',
    'source_table',
    'target_table',
    ['source_column'],
    ['target_column'],
    ondelete='CASCADE'
)
```

### Add Unique Constraint
```python
op.create_unique_constraint('uq_table_column', 'table_name', ['column_name'])
```

## Migration Commands

```bash
# Generate migration automatically
alembic revision --autogenerate -m "description"

# Create empty migration
alembic revision -m "description"

# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade <revision>

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision>

# Show current version
alembic current

# Show migration history
alembic history --verbose

# Show SQL without executing
alembic upgrade head --sql
```

## Best Practices

1. **Always write downgrade()** - Every migration should be reversible
2. **Test migrations** - Test both upgrade and downgrade on a copy of production data
3. **One logical change per migration** - Don't combine unrelated changes
4. **Use server_default** - For columns that should have defaults at DB level
5. **Handle data migration** - If changing types, migrate existing data
6. **Add comments** - Explain complex migrations
7. **Version control** - Commit migration files to git
8. **Never edit applied migrations** - Create new ones instead
9. **Coordinate with team** - Avoid migration conflicts
10. **Backup before migrating production** - Always!

## Data Migration Example

```python
def upgrade() -> None:
    """Add priority field and set default values."""

    # Add column (nullable first)
    op.add_column('tasks', sa.Column('priority', sa.Integer(), nullable=True))

    # Migrate existing data
    op.execute("""
        UPDATE tasks
        SET priority = 0
        WHERE priority IS NULL
    """)

    # Make column non-nullable
    op.alter_column('tasks', 'priority', nullable=False)


def downgrade() -> None:
    """Remove priority field."""
    op.drop_column('tasks', 'priority')
```

## PostgreSQL-Specific Features

```python
# Enum type
from sqlalchemy.dialects import postgresql

def upgrade() -> None:
    # Create enum type
    status_enum = postgresql.ENUM(
        'pending', 'in_progress', 'completed',
        name='task_status',
        create_type=True
    )
    status_enum.create(op.get_bind())

    # Use enum
    op.add_column(
        'tasks',
        sa.Column('status', status_enum, nullable=False, server_default='pending')
    )

def downgrade() -> None:
    op.drop_column('tasks', 'status')
    postgresql.ENUM(name='task_status').drop(op.get_bind())
```

## Testing Migrations

```python
# tests/test_migrations.py
import pytest
from alembic import command
from alembic.config import Config

@pytest.fixture
def alembic_config():
    config = Config("alembic.ini")
    return config

def test_upgrade_downgrade(alembic_config):
    """Test that upgrade and downgrade work."""
    # Upgrade to head
    command.upgrade(alembic_config, "head")

    # Downgrade to base
    command.downgrade(alembic_config, "base")

    # Upgrade again
    command.upgrade(alembic_config, "head")
```

## Output Checklist

- [ ] Migration file created with unique revision ID
- [ ] Upgrade function implements changes
- [ ] Downgrade function reverts changes
- [ ] Indexes are created/dropped appropriately
- [ ] Foreign keys have proper constraints
- [ ] Server defaults are set where needed
- [ ] Migration is tested (upgrade and downgrade)
- [ ] Migration file is committed to version control
- [ ] Documentation is updated if schema changes
