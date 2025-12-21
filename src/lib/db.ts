import * as SQLite from 'expo-sqlite'
import type { Note } from '~/lib/types'

const db = SQLite.openDatabaseSync('notes.db')

export function init() {
	db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      label TEXT,
      due TEXT,
      needsSync INTEGER DEFAULT 0  -- 0: Synced, 1: Needs Sync
    );

    CREATE TABLE IF NOT EXISTS pending_deletions (
      id TEXT PRIMARY KEY NOT NULL
    );
  `)
}

export function getNotes(): Note[] {
	const result = db.getAllSync('SELECT * FROM notes')
	return result.map((row: any) => ({
		id: row.id,
		userId: row.userId,
		title: row.title,
		content: row.content,
		label: row.label ?? null,
		due: row.due ? new Date(row.due) : null,
		isSynced: row.needsSync === 0 && row.userId !== 'local'
	}))
}

export function getDirtyNotes(): Note[] {
	return getNotes().filter(note => note.isSynced === false)
}

export function saveNote(note: Note, markAsDirty = true) {
	db.runSync(
		`INSERT OR REPLACE INTO notes (id, userId, title, content, label, due, needsSync) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[
			note.id,
			note.userId,
			note.title,
			note.content,
			note.label ?? null,
			note.due ? note.due.toISOString() : null,
			markAsDirty ? 1 : 0
		]
	)
}

export function deleteNote(id: string) {
	db.runSync('DELETE FROM notes WHERE id = ?', [id])
}

export function clearNotes() {
	db.runSync('DELETE FROM notes')
}

export function addPendingDeletion(id: string) {
	db.runSync('INSERT OR IGNORE INTO pending_deletions (id) VALUES (?)', [id])
}

export function getPendingDeletions(): string[] {
	const result = db.getAllSync('SELECT id FROM pending_deletions')
	return result.map((row: any) => row.id)
}

export function removePendingDeletion(id: string) {
	db.runSync('DELETE FROM pending_deletions WHERE id = ?', [id])
}
