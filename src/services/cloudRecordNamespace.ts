import type { AmeliaMemoryStore } from './ameliaIndexedMemory';

/** The research app uses its own RLS-protected table in the same user account. */
export const MAIN_MEMORY_TABLE='amelia_memory_records';
export const RESEARCH_MEMORY_TABLE='amelia_research_records';
export type CloudMemoryTable=typeof MAIN_MEMORY_TABLE|typeof RESEARCH_MEMORY_TABLE;
export type CloudMemoryRow={store:AmeliaMemoryStore;record_id:string;payload:Record<string,unknown>;updated_at:string};
export function cloudMemoryTable(research:boolean):CloudMemoryTable { return research ? RESEARCH_MEMORY_TABLE : MAIN_MEMORY_TABLE; }

/** Bootstrap a new research table from main once; thereafter keep it separate. */
export function selectCloudArchive(main:CloudMemoryRow[],own:CloudMemoryRow[],research:boolean):{rows:CloudMemoryRow[];bootstrapping:boolean} {
  if(!research) return {rows:main,bootstrapping:false};
  const hasCheckpoint=own.some(row=>row.store==='runtime'&&row.record_id==='live-checkpoint');
  if(hasCheckpoint) return {rows:own,bootstrapping:false};
  // A partial bootstrap can be resumed: already-copied research records win.
  const combined=new Map<string,CloudMemoryRow>();
  for(const row of main) combined.set(row.store+'::'+row.record_id,{...row,payload:{...row.payload,id:row.record_id}});
  for(const row of own) combined.set(row.store+'::'+row.record_id,{...row,payload:{...row.payload,id:row.record_id}});
  return {rows:[...combined.values()],bootstrapping:true};
}
