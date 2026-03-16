import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import './RepoViewer.css';

const createDirectoryNode = (name = '') => ({
  name,
  path: name,
  type: 'tree',
  children: [],
});

const buildTree = (entries) => {
  const root = createDirectoryNode('');

  entries.forEach((entry) => {
    const segments = entry.path.split('/');
    let currentNode = root;
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isLeaf = index === segments.length - 1;
      const nodeType = isLeaf ? entry.type : 'tree';
      let childNode = currentNode.children.find((child) => child.name === segment && child.type === nodeType);

      if (!childNode) {
        childNode = {
          name: segment,
          path: currentPath,
          type: nodeType,
          children: [],
          size: isLeaf ? entry.size : 0,
        };
        currentNode.children.push(childNode);
      }

      currentNode = childNode;
    });
  });

  const sortNodes = (nodes) => {
    nodes.sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === 'tree' ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });

    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(root.children);
  return root.children;
};

const flattenFiles = (entries) => entries
  .filter((entry) => entry.type === 'blob')
  .map((entry) => entry.path);

const getLanguageLabel = (path) => {
  const extension = path.split('.').pop()?.toLowerCase();

  const labels = {
    js: 'JavaScript',
    jsx: 'JavaScript React',
    ts: 'TypeScript',
    tsx: 'TypeScript React',
    json: 'JSON',
    css: 'CSS',
    html: 'HTML',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML',
    sql: 'SQL',
    sh: 'Shell',
    env: 'Environment',
    txt: 'Text',
  };

  return labels[extension] || 'Plain Text';
};

const TreeNode = ({ node, depth, expandedPaths, onToggle, onSelectFile, selectedFile }) => {
  const isDirectory = node.type === 'tree';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedFile === node.path;

  return (
    <div>
      <button
        type="button"
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 14}px` }}
        onClick={() => {
          if (isDirectory) {
            onToggle(node.path);
          } else {
            onSelectFile(node.path);
          }
        }}
      >
        <span className="tree-node-icon">{isDirectory ? (isExpanded ? '▾' : '▸') : '•'}</span>
        <span className="tree-node-name">{node.name}</span>
      </button>
      {isDirectory && isExpanded && node.children.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          expandedPaths={expandedPaths}
          onToggle={onToggle}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
};

const RepoViewer = () => {
  const { repoName } = useParams();
  const decodedRepoName = decodeURIComponent(repoName || '');
  const [repository, setRepository] = useState(null);
  const [treeEntries, setTreeEntries] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [treeLoading, setTreeLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [treeError, setTreeError] = useState('');
  const [fileError, setFileError] = useState('');
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  }), []);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setTreeLoading(true);
        setTreeError('');
        setFileError('');
        setFileContent('');
        setSelectedFile('');

        const response = await api.get(`/github/repos/${encodeURIComponent(decodedRepoName)}/tree`, {
          headers: authHeaders,
        });

        const nextEntries = response.data.tree || [];
        const filePaths = flattenFiles(nextEntries);
        const initialExpanded = new Set();

        filePaths.slice(0, 1).forEach((path) => {
          const segments = path.split('/');
          segments.slice(0, -1).reduce((currentPath, segment) => {
            const nextPath = currentPath ? `${currentPath}/${segment}` : segment;
            initialExpanded.add(nextPath);
            return nextPath;
          }, '');
        });

        setRepository(response.data.repository);
        setTreeEntries(nextEntries);
        setExpandedPaths(initialExpanded);

        if (filePaths.length > 0) {
          setSelectedFile(filePaths[0]);
        }
      } catch (error) {
        setTreeError(error.response?.data?.message || 'Failed to load repository contents.');
      } finally {
        setTreeLoading(false);
      }
    };

    fetchTree();
  }, [authHeaders, decodedRepoName]);

  useEffect(() => {
    const fetchFile = async () => {
      if (!selectedFile) {
        return;
      }

      try {
        setFileLoading(true);
        setFileError('');
        const response = await api.get(`/github/repos/${encodeURIComponent(decodedRepoName)}/file`, {
          headers: authHeaders,
          params: {
            path: selectedFile,
          },
        });

        setFileContent(response.data.content || '');
      } catch (error) {
        setFileContent('');
        setFileError(error.response?.data?.message || 'Failed to load file content.');
      } finally {
        setFileLoading(false);
      }
    };

    fetchFile();
  }, [authHeaders, decodedRepoName, selectedFile]);

  const treeData = useMemo(() => buildTree(treeEntries), [treeEntries]);

  const togglePath = (path) => {
    setExpandedPaths((currentPaths) => {
      const nextPaths = new Set(currentPaths);

      if (nextPaths.has(path)) {
        nextPaths.delete(path);
      } else {
        nextPaths.add(path);
      }

      return nextPaths;
    });
  };

  return (
    <div className="repo-viewer-page">
      <div className="repo-viewer-header">
        <div>
          <Link to="/" className="repo-viewer-back">← Back to repositories</Link>
          <h1 className="repo-viewer-title">{repository?.name || decodedRepoName}</h1>
          <p className="repo-viewer-subtitle">
            {repository?.description || 'Browse repository files and source code.'}
          </p>
        </div>
        {repository?.defaultBranch && (
          <div className="repo-meta-card">
            <span className="repo-meta-label">Branch</span>
            <strong>{repository.defaultBranch}</strong>
          </div>
        )}
      </div>

      {treeError ? (
        <div className="repo-viewer-error">{treeError}</div>
      ) : treeLoading ? (
        <div className="repo-viewer-loading">Loading repository viewer...</div>
      ) : (
        <div className="repo-viewer-shell">
          <aside className="repo-sidebar">
            <div className="repo-panel-header">
              <h2>Files</h2>
              <span>{flattenFiles(treeEntries).length} files</span>
            </div>
            <div className="repo-tree">
              {treeData.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  depth={0}
                  expandedPaths={expandedPaths}
                  onToggle={togglePath}
                  onSelectFile={setSelectedFile}
                  selectedFile={selectedFile}
                />
              ))}
            </div>
          </aside>

          <section className="repo-code-panel">
            <div className="repo-panel-header code-header">
              <div>
                <h2>{selectedFile || 'Select a file'}</h2>
                {selectedFile && <span>{getLanguageLabel(selectedFile)}</span>}
              </div>
              {repository?.url && (
                <a href={repository.url} target="_blank" rel="noopener noreferrer" className="repo-external-link">
                  Open on GitHub
                </a>
              )}
            </div>

            {fileError ? (
              <div className="repo-viewer-error inline">{fileError}</div>
            ) : fileLoading ? (
              <div className="repo-viewer-loading inline">Loading file...</div>
            ) : selectedFile ? (
              <div className="code-viewer-wrapper">
                <div className="code-line-numbers" aria-hidden="true">
                  {fileContent.split('\n').map((_, index) => (
                    <span key={`${selectedFile}-line-${index + 1}`}>{index + 1}</span>
                  ))}
                </div>
                <pre className="code-viewer"><code>{fileContent}</code></pre>
              </div>
            ) : (
              <div className="repo-viewer-loading inline">No file selected.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default RepoViewer;
