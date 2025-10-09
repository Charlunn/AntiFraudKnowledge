import { test, expect } from '@playwright/test';

const initialGraph = {
  graph: {
    nodes: [
      { id: 'Alice', name: 'Alice', category: 'person', value: 1, properties: { name: 'Alice', type: 'person' } },
      { id: 'Bob', name: 'Bob', category: 'person', value: 1, properties: { name: 'Bob', type: 'person' } },
      { id: 'Carol', name: 'Carol', category: 'organization', value: 1, properties: { name: 'Carol Corp', type: 'organization' } }
    ],
    links: [
      { source: 'Alice', target: 'Bob', label: '联络', value: 1 },
      { source: 'Bob', target: 'Carol', label: '交易', value: 1 }
    ],
    categories: [
      { name: 'person' },
      { name: 'organization' }
    ],
    counts: { nodes: 3, links: 2 }
  },
  meta: { limit: 50 }
};

const searchGraph = {
  graph: {
    nodes: [
      { id: 'ZhangSan', name: '张三', category: 'person', value: 1, properties: { name: '张三' } }
    ],
    links: [],
    categories: [{ name: 'person' }],
    counts: { nodes: 1, links: 0 }
  },
  meta: { query: '张三' }
};

const analysisResponse = {
  analysis_type: 'shortest_path',
  graph: {
    nodes: [
      { id: 'Alice', name: 'Alice', category: 'person' },
      { id: 'Bob', name: 'Bob', category: 'person' }
    ],
    links: [
      { source: 'Alice', target: 'Bob', label: '最短路径', value: 1 }
    ],
    categories: [{ name: 'person' }],
    counts: { nodes: 2, links: 1 }
  },
  meta: {
    source: 'Alice',
    target: 'Bob',
    max_depth: 6,
    steps_found: 1
  }
};

test.describe('Knowledge graph page', () => {
  test('renders initial graph summary', async ({ page }) => {
    await page.route('**/api/**', route => route.fulfill({ status: 200, json: {} }));
    await page.route('**/api/graph/initial/**', route => route.fulfill({ status: 200, json: initialGraph }));

    await page.goto('/graph');

    await expect(page.getByText('3 个节点')).toBeVisible();
    await expect(page.getByText('2 个关系')).toBeVisible();
  });

  test('performs global search and updates counts', async ({ page }) => {
    await page.route('**/api/**', route => route.fulfill({ status: 200, json: {} }));
    await page.route('**/api/graph/initial/**', route => route.fulfill({ status: 200, json: initialGraph }));
    await page.route('**/api/graph/search/**', async route => {
      await route.fulfill({ status: 200, json: searchGraph });
      await page.unroute('**/api/graph/search/**');
    });

    await page.goto('/graph');

    const searchInput = page.locator('header input');
    await searchInput.first().fill('张三');
    await searchInput.first().press('Enter');

    await expect(page.getByText('1 个节点')).toBeVisible();
    await expect(page.getByText('0 个关系')).toBeVisible();
  });

  test('runs shortest path analysis from toolbar', async ({ page }) => {
    await page.route('**/api/**', route => route.fulfill({ status: 200, json: {} }));
    await page.route('**/api/graph/initial/**', route => route.fulfill({ status: 200, json: initialGraph }));
    await page.route('**/api/graph/analysis/**', async route => {
      await route.fulfill({ status: 200, json: analysisResponse });
      await page.unroute('**/api/graph/analysis/**');
    });

    await page.goto('/graph');

    const sourceInput = page.getByPlaceholder('源节点ID');
    await sourceInput.fill('Alice');
    const targetInput = page.getByPlaceholder('目标节点ID');
    await targetInput.fill('Bob');
    await page.getByRole('button', { name: '执行分析' }).click();

    await expect(page.getByText('分析完成')).toBeVisible();
  });
});