export interface Thread {
    id: string;
    title: string;
    isClosed: boolean;
    isFlagged: boolean;
    headComment: HeadComment;
    project: string;
    subproject: string;
    language: string;
    key: string;
    sourceTranslation?: string;
}

interface HeadComment {
    text: string;
    date: number;
    author: Author;
}

export interface Comment extends HeadComment {
    event: string | null;
}

interface Author {
    username: string;
    picture: string;
}
