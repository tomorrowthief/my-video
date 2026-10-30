// Deployment scaffold only. Production export remains disabled until durable jobs,
// quotas, R2 storage, recovery and abuse controls pass their own integration tests.
import {Container} from '@cloudflare/containers';

export class StudioRenderer extends Container {
  defaultPort = 3401;
  sleepAfter = '20m';
  enableInternet = false;
  envVars = {
    STUDIO_HOST: '0.0.0.0', STUDIO_PORT: '3401',
    STUDIO_ALLOWED_HOSTS: 'localhost,127.0.0.1,renderer.internal',
  };
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    // An explicit server-side preview credential permits health checks only.
    // It cannot enable anonymous uploads/renders or be included in the web bundle.
    if (path === '/api/studio/health' && request.method === 'GET' &&
      env.STUDIO_PREVIEW_TOKEN && request.headers.get('X-Studio-Preview') === env.STUDIO_PREVIEW_TOKEN) {
      const container = env.STUDIO_RENDERER.getByName('integration-preview');
      return container.fetch(new Request('http://renderer.internal/api/studio/health'));
    }
    return Response.json({error: {code: 'CLOUD_RENDER_NOT_CONFIGURED',
      message: '云端渲染尚未接入。请使用本地渲染服务。'}}, {status: 503});
  },
};
