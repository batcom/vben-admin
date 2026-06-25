import { describe, it, expect } from 'vitest';
import { registerFieldType, getFieldComponent, getRegisteredTypes } from '../registry';

describe('registry', () => {
  it('registers and retrieves a field component', () => {
    const dummy = { component: {} as any };
    registerFieldType('test-type', dummy);
    expect(getFieldComponent('test-type')).toBe(dummy);
  });

  it('returns undefined for unregistered types', () => {
    expect(getFieldComponent('nonexistent')).toBeUndefined();
  });

  it('lists all registered type keys', () => {
    registerFieldType('key-a', { component: {} as any });
    const keys = getRegisteredTypes();
    expect(keys).toContain('key-a');
  });
});
