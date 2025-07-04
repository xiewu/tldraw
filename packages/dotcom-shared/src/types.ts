import { stringEnum } from '@tldraw/utils'
import type { SerializedSchema, SerializedStore, TLRecord } from 'tldraw'
import {
	TlaFile,
	TlaFilePartial,
	TlaFileState,
	TlaFileStatePartial,
	TlaGroup,
	TlaGroupFile,
	TlaGroupFilePartial,
	TlaGroupPartial,
	TlaGroupUser,
	TlaGroupUserPartial,
	TlaRow,
	TlaUser,
	TlaUserPartial,
	TlaUserPresence,
	TlaUserPresencePartial,
} from './tlaSchema'

export interface Snapshot {
	schema: SerializedSchema
	snapshot: SerializedStore<TLRecord>
}

export interface CreateRoomRequestBody {
	origin: string
	snapshot: Snapshot
}

export interface CreateSnapshotRequestBody {
	schema: SerializedSchema
	snapshot: SerializedStore<TLRecord>
	parent_slug?: string | undefined
}

export type CreateSnapshotResponseBody =
	| {
			error: false
			roomId: string
	  }
	| {
			error: true
			message: string
	  }

export interface GetReadonlySlugResponseBody {
	slug: string
	isLegacy: boolean
}

/* ----------------------- App ---------------------- */

export interface CreateFilesRequestBody {
	origin: string
	snapshots: Snapshot[]
}

export type CreateFilesResponseBody =
	| {
			error: false
			slugs: string[]
	  }
	| {
			error: true
			message: string
	  }

export type PublishFileResponseBody =
	| {
			error: false
	  }
	| {
			error: true
			message: string
	  }

export type UnpublishFileResponseBody =
	| {
			error: false
	  }
	| {
			error: true
			message: string
	  }

// legacy version 1, needed for migration
export interface ZStoreDataV1 {
	files: TlaFile[]
	fileStates: TlaFileState[]
	user: TlaUser
	lsn: string
}

// legacy version 2, needed for migration
export interface ZStoreDataV2 {
	file: TlaFile[]
	file_state: TlaFileState[]
	user: TlaUser[]
	lsn: string
}

// current version
export interface ZStoreData {
	file: TlaFile[]
	file_state: TlaFileState[]
	user: TlaUser[]
	group: TlaGroup[]
	group_user: TlaGroupUser[]
	user_presence: TlaUserPresence[]
	group_file: TlaGroupFile[]
	lsn: string
}

export type ZRowUpdate = ZRowInsert | ZRowDeleteOrUpdate

export interface ZRowInsert {
	row: TlaRow
	table: ZTable
	event: 'insert'
}

export interface ZRowDeleteOrUpdate {
	row:
		| TlaFilePartial
		| TlaFileStatePartial
		| TlaUserPartial
		| TlaGroupPartial
		| TlaGroupUserPartial
		| TlaUserPresencePartial
		| TlaGroupFilePartial
	table: ZTable
	event: 'update' | 'delete'
}

export type ZTable =
	| 'file'
	| 'file_state'
	| 'user'
	| 'group'
	| 'group_user'
	| 'user_presence'
	| 'group_file'

export type ZEvent = 'insert' | 'update' | 'delete'

export const ZErrorCode = stringEnum(
	'publish_failed',
	'unpublish_failed',
	'republish_failed',
	'unknown_error',
	'client_too_old',
	'forbidden',
	'bad_request',
	'rate_limit_exceeded',
	'max_files_reached'
)
export type ZErrorCode = keyof typeof ZErrorCode

// increment this to force clients to reload
// e.g. if we make backwards-incompatible changes to the schema
export const Z_PROTOCOL_VERSION = 2
export const MIN_Z_PROTOCOL_VERSION = 1

export function downgradeZStoreData(data: ZStoreData): ZStoreDataV1 {
	return {
		files: data.file,
		fileStates: data.file_state,
		user: data.user[0] ?? null,
		lsn: data.lsn,
	}
}

export type ZServerSentPacket =
	| {
			type: 'initial_data'
			initialData: ZStoreData
	  }
	| {
			type: 'update'
			update: ZRowUpdate
	  }
	| {
			type: 'commit'
			mutationIds: string[]
	  }
	| {
			type: 'reject'
			mutationId: string
			errorCode: ZErrorCode
	  }

export type ZServerSentMessage = ZServerSentPacket[]

export type ZClientSentMessage =
	| {
			type: 'mutate'
			mutationId: string
			updates: ZRowUpdate[]
	  }
	| {
			type: 'mutator'
			mutationId: string
			name: string
			props: object
	  }

export const UserPreferencesKeys = [
	'locale',
	'animationSpeed',
	'edgeScrollSpeed',
	'colorScheme',
	'isSnapMode',
	'isWrapMode',
	'isDynamicSizeMode',
	'isPasteAtCursorMode',
	'name',
	'color',
] as const satisfies Array<keyof TlaUser>

export interface SubmitFeedbackRequestBody {
	description: string
	allowContact: boolean
	url: string
}

export const MAX_PROBLEM_DESCRIPTION_LENGTH = 2000
