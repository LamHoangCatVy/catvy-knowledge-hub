const fs = require('fs');
const path = require('path');

module.exports = function projectPagesPlugin() {
  return {
    name: 'project-pages-plugin',

    async contentLoaded({ actions }) {
      const { addRoute } = actions;

      // Admin page
      addRoute({
        path: '/admin',
        component: '@site/src/components/Portfolio/AdminPage',
        exact: true,
      });

      try {
        const dataPath = path.join(process.cwd(), 'static', 'data', 'projects-showcase.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // Listing page
        addRoute({
          path: '/projects',
          component: '@site/src/components/Portfolio/ProjectListPage',
          exact: true,
        });

        // Detail pages
        for (const project of data.projects) {
          addRoute({
            path: `/project/${project.id}`,
            component: '@site/src/components/Portfolio/ProjectDetailPage',
            exact: true,
          });
        }
      } catch (err) {
        console.warn('[project-pages] Error:', err.message);
      }
    },
  };
};
