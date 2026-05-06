import type { NodeData } from './constants';
import { NODE_COLORS } from './constants';
import { PROJECTS_DATA } from './projects';
import { CERTS_DATA } from './certifications';
import { COMMUNITY_DATA } from './community';

export function getNodeData(id: string | null): NodeData | null {
  if (!id) return null;

  if (id === 'core_projects')
    return { id, type: 'core', title: 'AI & Cloud Deployments', subtitle: 'Enterprise Architectures', list: PROJECTS_DATA, color: NODE_COLORS.projects, icon: 'fas fa-microchip' };
  if (id === 'core_certs')
    return { id, type: 'core', title: 'Credentials Vault', subtitle: 'Certifications & Skills', list: CERTS_DATA, color: NODE_COLORS.certs, icon: 'fas fa-award' };
  if (id === 'core_comm')
    return { id, type: 'core', title: 'Community & Leadership', subtitle: 'Ecosystem Contributions', list: COMMUNITY_DATA, color: NODE_COLORS.community, icon: 'fas fa-users' };

  if (id.startsWith('proj')) {
    const found = PROJECTS_DATA.find(p => p.id === id);
    return found ? { ...found, type: 'sub' } : null;
  }
  if (id.startsWith('cert')) {
    const found = CERTS_DATA.find(c => c.id === id);
    return found ? { ...found, type: 'sub' } : null;
  }
  if (id.startsWith('comm')) {
    const found = COMMUNITY_DATA.find(c => c.id === id);
    return found ? { ...found, type: 'sub' } : null;
  }
  return null;
}

export function getListForNode(id: string | null): Array<{ id: string }> {
  if (!id) return [];
  if (id.startsWith('proj') || id === 'core_projects') return PROJECTS_DATA;
  if (id.startsWith('cert') || id === 'core_certs') return CERTS_DATA;
  if (id.startsWith('comm') || id === 'core_comm') return COMMUNITY_DATA;
  return [];
}
