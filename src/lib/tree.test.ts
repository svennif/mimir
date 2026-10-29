import { describe, expect, test } from 'vitest';
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';
import { byPosition, childrenOf, descendantIds, flatten, indexByParent, type PageNode } from './tree';

const node = (id: string, parentId: string | null, position: string): PageNode => ({
  id, parentId, position, title: id, icon: null,
});

describe('byPosition', () => {
  test('compares by code point, so uppercase sorts before lowercase', () => {
    // A key inserted before 'a0' is 'Zz'. A locale-aware compare (what
    // Postgres ORDER BY does by default) puts 'a0' first — the wrong way round.
    const before = generateKeyBetween(null, 'a0');
    expect(before).toBe('Zz');

    expect(['a0', before].sort((a, b) => a.localeCompare(b))).toEqual(['a0', 'Zz']);
    expect([{ position: 'a0' }, { position: before }].sort(byPosition).map((n) => n.position)).toEqual(['Zz', 'a0']);
  });

  test('returns 0 for equal positions', () => {
    expect(byPosition({ position: 'a0' }, { position: 'a0' })).toBe(0);
  });

  test('restores the order fractional-indexing generated, however it was shuffled', () => {
    // Insert at the front, back and middle so the keys span several characters.
    let keys = generateNKeysBetween(null, null, 3);
    keys = [generateKeyBetween(null, keys[0]), ...keys];
    keys = [...keys, generateKeyBetween(keys.at(-1)!, null)];
    keys.splice(2, 0, generateKeyBetween(keys[1], keys[2]));

    const shuffled = [...keys].reverse().map((position) => ({ position }));
    expect(shuffled.sort(byPosition).map((n) => n.position)).toEqual(keys);
  });
});

describe('indexByParent', () => {
  test('groups by parent and sorts each group by position', () => {
    const map = indexByParent([
      node('b', null, 'a1'),
      node('child2', 'a', 'a1'),
      node('a', null, 'a0'),
      node('child1', 'a', 'Zz'),
    ]);

    expect(childrenOf(map, null).map((n) => n.id)).toEqual(['a', 'b']);
    expect(childrenOf(map, 'a').map((n) => n.id)).toEqual(['child1', 'child2']);
    expect(childrenOf(map, 'b')).toEqual([]);
  });
});

describe('flatten', () => {
  const nodes = [
    node('folder', null, 'a0'),
    node('child', 'folder', 'a0'),
    node('grandchild', 'child', 'a0'),
    node('page', null, 'a1'),
  ];

  test('only walks into expanded folders', () => {
    expect(flatten(nodes, new Set()).map((r) => r.id)).toEqual(['folder', 'page']);
    expect(flatten(nodes, new Set(['folder'])).map((r) => [r.id, r.depth])).toEqual([
      ['folder', 0], ['child', 1], ['page', 0],
    ]);
  });

  test('marks rows with children and whether they are open', () => {
    const [folder, child, page] = flatten(nodes, new Set(['folder']));
    expect(folder).toMatchObject({ hasChildren: true, expanded: true });
    expect(child).toMatchObject({ hasChildren: true, expanded: false });
    expect(page).toMatchObject({ hasChildren: false, expanded: false });
  });

  test('skips hidden rows along with everything under them', () => {
    const rows = flatten(nodes, new Set(['folder', 'child']), new Set(['child']));
    expect(rows.map((r) => r.id)).toEqual(['folder', 'page']);
  });
});

describe('descendantIds', () => {
  test('collects every level below the root, not the root itself', () => {
    const nodes = [
      node('root', null, 'a0'),
      node('a', 'root', 'a0'),
      node('b', 'root', 'a1'),
      node('a1', 'a', 'a0'),
      node('other', null, 'a1'),
    ];
    expect(descendantIds(nodes, 'root').sort()).toEqual(['a', 'a1', 'b']);
    expect(descendantIds(nodes, 'other')).toEqual([]);
  });
});
