import { BadRequestException } from '@nestjs/common';
import type { ProcessorContext, CrudProcessor, ProcessorRef } from './crud.types';

const BUILTIN = new Map<string, CrudProcessor>();

export function registerBuiltin(name: string, processor: CrudProcessor) {
  BUILTIN.set(name, processor);
}

export function getBuiltinProcessor(name: string): CrudProcessor | undefined {
  return BUILTIN.get(name);
}

export async function runPipeline(
  refs: ProcessorRef[],
  processors: Record<string, CrudProcessor>,
  ctx: ProcessorContext,
): Promise<void> {
  for (const ref of refs) {
    const p = typeof ref.use === 'string'
      ? processors[ref.use] ?? getBuiltinProcessor(ref.use)
      : processors[ref.use.name] ?? ref.use;
    if (!p) throw new BadRequestException(`Unknown processor: ${ref.use}`);

    // Merge config into context for this processor
    if (ref.config) {
      ctx._processorConfig = ref.config;
    }
    await p.execute(ctx);
  }
}
