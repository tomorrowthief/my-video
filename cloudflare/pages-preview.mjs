// Static Studio hosting: reserve the render API until Containers are connected.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/studio' || pathname.startsWith('/api/studio/')) {
      return Response.json({ error: {
        code: 'CLOUD_RENDER_NOT_CONFIGURED',
        message: '云端 MP4 渲染尚未接通。可先编辑、上传素材并预览；MP4 导出请使用本地版本。',
      } }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    return env.ASSETS.fetch(request);
  },
};
