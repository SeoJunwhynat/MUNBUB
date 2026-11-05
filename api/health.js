/* Public readiness probe. Only the explicit ?probe=blob query performs safe, read-only connectivity tests. */
import { get, list } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { configured, noCache } from '../lib/mb-server.js';

export default async function handler(req, res) {
  noCache(res);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET 요청만 지원해.' });
  }
  if (!configured()) {
    return res.status(503).json({
      status: 'setup-required',
      accounts: false,
      publicRooms: false,
      nextStep: 'Vercel Storage에서 기존 Blob 스토어와 Production 환경변수 연결을 확인해 줘.'
    });
  }
  if (req.query?.probe !== 'blob') {
    return res.status(200).json({
      status: 'configured',
      accounts: true,
      publicRooms: true,
      note: '토큰 존재 여부만 확인한 상태야. 실제 저장소 연결은 ?probe=blob으로 확인해 줘.'
    });
  }

  // No account data is fetched or changed; only an empty prefix and a nonexistent private path are queried.
  try {
    const nonce = randomUUID();
    await list({ prefix: '__mb_blob_health_check__/' + nonce, limit: 1 });
    const missing = await get('__mb_blob_health_check__/' + nonce + '.json', {
      access: 'private',
      useCache: false
    });
    if (missing && missing.statusCode !== 404) {
      return res.status(503).json({
        status: 'storage-check-inconclusive',
        note: '스토리지 인증 확인을 마치지 못했어.'
      });
    }
    return res.status(200).json({
      status: 'storage-readable',
      tokenPresent: true,
      listSucceeded: true,
      privateReadSucceeded: true,
      writeTested: false,
      note: '읽기 권한만 확인됨. 쓰기 권한은 계정 API에서 따로 확인해야 해.'
    });
  } catch (error) {
    // Never log the token, request authorization headers, or an error message which might contain credentials.
    console.error('Blob health probe failed:', {
      name: typeof error?.name === 'string' ? error.name.slice(0, 80) : 'Unknown',
      statusCode: Number(error?.statusCode || error?.status || 0) || undefined,
      code: typeof error?.code === 'string' ? error.code.slice(0, 80) : undefined
    });
    return res.status(503).json({
      status: 'storage-unreachable',
      tokenPresent: true,
      nextStep: 'Vercel Storage에서 Blob 저장소의 접근 모드(Private), 프로젝트 연결, Production 토큰 유효성을 확인해 줘.'
    });
  }
}
