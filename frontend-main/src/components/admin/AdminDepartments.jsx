import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Modal, Field, TextInput, Card, Toggle, Pill } from './AdminShared';

export default function AdminDepartments() {
  const [tab, setTab] = useState('depts');
  const [depts, setDepts] = useState([]);
  const [levels, setLevels] = useState([]);
  const [modal, setModal] = useState(null);

  const load = async () => { setDepts(await mockApi.admin.getDepartments()); setLevels(await mockApi.admin.getAcademicLevels()); };
  useEffect(() => { load(); }, []);

  const saveDept = async () => {
    if (modal.isNew) await mockApi.admin.createDepartment(modal.item);
    else await mockApi.admin.updateDepartment(modal.item.id, modal.item);
    setModal(null); await load();
  };
  const saveLevel = async () => {
    const body = { ...modal.item, value: modal.item.value, sort_order: Number(modal.item.sort_order) || undefined };
    if (modal.isNew) await mockApi.admin.createAcademicLevel(body);
    else await mockApi.admin.updateAcademicLevel(modal.item.id, body);
    setModal(null); await load();
  };
  const delDept = async (id) => { await mockApi.admin.deleteDepartment(id); await load(); };
  const delLevel = async (id) => { await mockApi.admin.deleteAcademicLevel(id); await load(); };
  const toggleDept = async (d) => { await mockApi.admin.updateDepartment(d.id, { is_active: !d.is_active }); await load(); };
  const toggleLevel = async (l) => { await mockApi.admin.updateAcademicLevel(l.id, { is_active: !l.is_active }); await load(); };

  if (!depts.length && !levels.length) return <LoadingSpinner label="Loading..." />;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-full bg-cocoa-100">
        {[{ id: 'depts', label: 'Departments' }, { id: 'levels', label: 'Academic Levels' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-full text-xs font-bold ${tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'depts' ? (
        <div className="space-y-2">
          <div className="flex justify-end"><button onClick={() => setModal({ item: { name: '', faculty: 'Engineering' }, isNew: true, kind: 'dept' })} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add</button></div>
          {depts.map((d) => (
            <Card key={d.id} className="flex items-center gap-3 !p-3">
              <div className="flex-1"><div className="font-bold text-sm text-cocoa-800">{d.name}</div><div className="text-xs text-cocoa-400">Faculty: {d.faculty}</div></div>
              <Pill tone={d.is_active ? 'green' : 'red'}>{d.is_active ? 'Active' : 'Hidden'}</Pill>
              <Toggle checked={d.is_active} onChange={() => toggleDept(d)} />
              <button onClick={() => delDept(d.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end"><button onClick={() => setModal({ item: { name: '', value: '', sort_order: 1 }, isNew: true, kind: 'level' })} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add</button></div>
          {levels.map((l) => (
            <Card key={l.id} className="flex items-center gap-3 !p-3">
              <div className="flex-1"><div className="font-bold text-sm text-cocoa-800">{l.name}</div><div className="text-xs text-cocoa-400">Value: {l.value}</div></div>
              <Pill tone={l.is_active ? 'green' : 'red'}>{l.is_active ? 'Active' : 'Hidden'}</Pill>
              <Toggle checked={l.is_active} onChange={() => toggleLevel(l)} />
              <button onClick={() => delLevel(l.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.isNew ? 'Add New' : 'Edit'}>
        {modal && modal.kind === 'dept' ? (
          <div className="space-y-3">
            <Field label="Department name"><TextInput value={modal.item.name} onChange={(e) => setModal({ item: { ...modal.item, name: e.target.value }, kind: modal.kind, isNew: modal.isNew })} /></Field>
            <Field label="Faculty"><select value={modal.item.faculty} onChange={(e) => setModal({ item: { ...modal.item, faculty: e.target.value }, kind: modal.kind, isNew: modal.isNew })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm"><option value="Engineering">Engineering</option><option value="Sciences">Sciences</option><option value="Agriculture">Agriculture</option><option value="Environmental Technology">Environmental Technology</option><option value="Management Sciences">Management Sciences</option><option value="Social Sciences">Social Sciences</option><option value="Education">Education</option></select></Field>
            <button onClick={saveDept} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm">Save</button>
          </div>
        ) : modal && (
          <div className="space-y-3">
            <Field label="Level name"><TextInput value={modal.item.name} onChange={(e) => setModal({ item: { ...modal.item, name: e.target.value }, kind: modal.kind, isNew: modal.isNew })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Value (e.g. 100L, PG)"><TextInput value={modal.item.value} onChange={(e) => setModal({ item: { ...modal.item, value: e.target.value }, kind: modal.kind, isNew: modal.isNew })} placeholder="100L" /></Field>
              <Field label="Sort order"><TextInput type="number" value={modal.item.sort_order} onChange={(e) => setModal({ item: { ...modal.item, sort_order: e.target.value }, kind: modal.kind, isNew: modal.isNew })} /></Field>
            </div>
            <button onClick={saveLevel} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm">Save</button>
          </div>
        )}
      </Modal>
    </div>
  );
}