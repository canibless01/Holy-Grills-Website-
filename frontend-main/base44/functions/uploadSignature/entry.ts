import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";

const ALLOWED_FOLDERS = [
  'menu_items',
  'categories',
  'rewards',
  'marketplace',
  'events',
  'banners',
  'storefront',
  'avatars',
  'general',
];

async function sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin')
      return Response.json({ error: 'Admin access required' }, { status: 403 });

    const cloudName = secrets.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = secrets.get('CLOUDINARY_API_KEY');
    const apiSecret = secrets.get('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret)
      return Response.json({ error: 'Cloudinary not configured' }, { status: 500 });

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const folder = ALLOWED_FOLDERS.includes(body.folder) ? body.folder : 'general';

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = await sha1Hex(paramsToSign + apiSecret);

    return Response.json({
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}