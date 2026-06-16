import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

interface TreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children: TreeNode[];
  expanded: boolean;
}

@Component({
  selector: 'app-project-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-tree.component.html',
  styleUrl: './project-tree.component.css'
})
export class ProjectTreeComponent implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  tree: TreeNode[] = [];
  filteredTree: TreeNode[] = [];

  searchText = '';
  isLoading = false;
  errorMessage = '';

  readonly fileUrl = '/assets/tree/project-structure-paths.txt';

  async ngOnInit(): Promise<void> {
    await this.loadTree();
  }

  async loadTree(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await fetch(`${this.fileUrl}?v=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`File load failed: ${response.status}`);
      }

      const text = await response.text();

      this.tree = this.buildTree(text);
      this.sortTree(this.tree);
      this.filteredTree = [...this.tree];

    } catch (error) {
      console.error('[ProjectTree]', error);
      this.errorMessage = 'خطا در خواندن فایل ساختار پروژه';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  buildTree(text: string): TreeNode[] {
    const root: TreeNode[] = [];

    const paths = text
      .replace(/\uFEFF/g, '')
      .split(/\r?\n/)
      .map(x => x.trim().replace(/\\/g, '/'))
      .filter(x => x.length > 0);

    for (const fullPath of paths) {
      this.addPath(root, fullPath);
    }

    return root;
  }

  addPath(root: TreeNode[], fullPath: string): void {
    const isFolderPath = fullPath.endsWith('/');

    const cleanPath = fullPath
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

    if (!cleanPath) {
      return;
    }

    const parts = cleanPath
      .split('/')
      .map(x => x.trim())
      .filter(Boolean);

    if (parts.length === 1 && !isFolderPath) {
      return;
    }

    let level = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const isLast = index === parts.length - 1;
      const nodeType: 'folder' | 'file' =
        isLast && !isFolderPath ? 'file' : 'folder';

      let node = level.find(x => x.name === part);

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: nodeType,
          children: [],
          expanded: index < 1
        };

        level.push(node);
      }

      if (isLast && isFolderPath) {
        node.type = 'folder';
      }

      level = node.children;
    });
  }

  sortTree(nodes: TreeNode[]): void {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      this.sortTree(node.children);
    }
  }

  toggle(node: TreeNode): void {
    if (node.type !== 'folder') {
      return;
    }

    node.expanded = !node.expanded;
    this.cdr.detectChanges();
  }

  filterTree(value: string): void {
    this.searchText = value.toLowerCase().trim();

    if (!this.searchText) {
      this.filteredTree = [...this.tree];
      this.cdr.detectChanges();
      return;
    }

    this.filteredTree = this.filterNodes(this.tree);
    this.cdr.detectChanges();
  }

  filterNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .map(node => {
        const children = this.filterNodes(node.children);

        const matched =
          node.name.toLowerCase().includes(this.searchText) ||
          node.path.toLowerCase().includes(this.searchText);

        if (matched || children.length > 0) {
          return {
            ...node,
            expanded: true,
            children
          };
        }

        return null;
      })
      .filter(x => x !== null) as TreeNode[];
  }

  expandAll(): void {
    this.setExpanded(this.filteredTree, true);
    this.cdr.detectChanges();
  }

  collapseAll(): void {
    this.setExpanded(this.filteredTree, false);
    this.cdr.detectChanges();
  }

  setExpanded(nodes: TreeNode[], expanded: boolean): void {
    for (const node of nodes) {
      if (node.type === 'folder') {
        node.expanded = expanded;
      }

      if (node.children.length > 0) {
        this.setExpanded(node.children, expanded);
      }
    }
  }

  getIcon(node: TreeNode): string {
    if (node.type === 'folder') {
      return node.expanded ? 'mdi mdi-folder-open' : 'mdi mdi-folder';
    }

    const name = node.name.toLowerCase();

    if (name.endsWith('.ts')) return 'mdi mdi-language-typescript';
    if (name.endsWith('.html')) return 'mdi mdi-language-html5';
    if (name.endsWith('.css') || name.endsWith('.scss')) return 'mdi mdi-language-css3';
    if (name.endsWith('.json')) return 'mdi mdi-code-json';
    if (name.endsWith('.js')) return 'mdi mdi-language-javascript';
    if (name.endsWith('.txt')) return 'mdi mdi-file-document-outline';

    return 'mdi mdi-file-outline';
  }
}