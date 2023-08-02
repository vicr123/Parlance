declare module "wink-pos-tagger" {
    interface Token {
        value: string
        tag: "word" | "punctuation" | "alien"
        normal: string
        pos: "DT" | "NN" | "RB" | "VBD" | "." | "PRP" | "MD" | "VB" | "PDT" | "BBS" | "NNP" | "VBZ" | "NNS"
        lemma?: string
    }
    
    interface Tagger {
        tagSentence: (sentence: string) => Token[]; 
    }
    
    function defaultExport(): Tagger;
    export default defaultExport;
}