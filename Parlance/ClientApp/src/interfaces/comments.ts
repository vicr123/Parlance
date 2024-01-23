export interface Thread {
    id: string
    title: string
    isClosed: boolean
    isFlagged: boolean
    author: Author
    headCommentBody: string
    project: string
    subproject: string
    language: string
    key: string
    sourceTranslation?: string
}

export interface Comment {
    text: string,
    date: number,
    author: Author,
    event: string | null
}

interface Author {
    username: string
    picture: string
}
