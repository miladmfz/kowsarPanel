import { CrudListState } from './crud-list-state';

interface Row { id: number; title: string; }

describe('CrudListState', () => {
  it('tracks the load lifecycle', () => {
    const state = new CrudListState<Row>();
    state.beginLoad();
    expect(state.loading()).toBeTrue();
    state.resolve([{ id: 1, title: 'one' }]);
    expect(state.loading()).toBeFalse();
    expect(state.status()).toBe('loaded');
    expect(state.records()).toEqual([{ id: 1, title: 'one' }]);
  });

  it('supports immutable upsert and remove operations', () => {
    const state = new CrudListState<Row>();
    state.resolve([{ id: 1, title: 'one' }]);
    state.upsert({ id: 1, title: 'updated' }, row => row.id === 1);
    state.upsert({ id: 2, title: 'two' }, row => row.id === 2);
    state.remove(row => row.id === 1);
    expect(state.records()).toEqual([{ id: 2, title: 'two' }]);
  });

  it('clears stale rows when loading fails', () => {
    const state = new CrudListState<Row>();
    state.resolve([{ id: 1, title: 'one' }]);
    state.reject('failed');
    expect(state.status()).toBe('error');
    expect(state.errorMessage()).toBe('failed');
    expect(state.records()).toEqual([]);
  });
});
