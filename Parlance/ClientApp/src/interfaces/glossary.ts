export interface Glossary {
    id: string,
    name: string,
    createdDate: string,
    usedByProjects: number
}

export interface GlossaryItem {
    id: string
    term: string
    translation: string
}