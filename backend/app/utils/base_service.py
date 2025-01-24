# app/utils/base_service.py
from typing import Optional
import aiohttp
import asyncio
from contextlib import asynccontextmanager

class BaseService:
    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None
        self._cleanup_task = None

    async def get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
            # Create cleanup task
            if self._cleanup_task is None:
                self._cleanup_task = asyncio.create_task(self._cleanup_on_shutdown())
        return self._session

    async def _cleanup_on_shutdown(self):
        try:
            await asyncio.get_event_loop().create_future()  # wait forever
        except asyncio.CancelledError:
            if self._session and not self._session.closed:
                await self._session.close()
            
    @asynccontextmanager
    async def session(self):
        session = await self.get_session()
        try:
            yield session
        finally:
            # Session will be cleaned up on shutdown, not here
            pass

    async def cleanup(self):
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass