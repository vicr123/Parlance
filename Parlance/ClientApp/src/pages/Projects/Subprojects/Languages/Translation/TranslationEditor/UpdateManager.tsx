import EventEmitter from "eventemitter3";
import Fetch from "../../../../../../helpers/Fetch";
import {useParams} from "react-router-dom";
import {useState} from "react";
import {TranslationWithPluralType} from "../../../../../../interfaces/translation";
import Modal from "../../../../../../components/Modal";
import ConflictResolutionModal from "./Modals/ConflictResolutionModal";

interface Update {
    translationStrings: TranslationWithPluralType[]
}

export class UpdateManager extends EventEmitter {
    private nextUpdate: {[key: string]: Update};
    private updating: boolean;
    private submitting: {[key: string]: Update};
    private conflicts: {[key: string]: TranslationWithPluralType[]};
    
    private readonly project: string;
    private readonly subproject: string;
    private readonly language: string;
    
    private etag: string;
    
    constructor(project: string, subproject: string, language: string) {
        super();
        this.project = project;
        this.subproject = subproject;
        this.language = language;
        this.updating = false;
        this.nextUpdate = {};
        this.submitting = {};
        this.conflicts = {};
        this.etag = "";
    }
    
    queueForUpdate(key: string, data: Update) {
        if (this.conflicts[key]) {
            Modal.mount(<ConflictResolutionModal translationKey={key} current={data.translationStrings} incoming={this.conflicts[key]} updateManager={this} />)
            return;
        }
        
        this.nextUpdate[key] = data;
        this.emit("keyStateChanged");
        this.pushUpdates();
    }
    
    setEtag(etag: string) {
        this.etag = etag;
    }
    
    async pushUpdates() {
        if (this.updating) return;
        this.updating = true;
        
        try {
            let data = this.nextUpdate;
            this.submitting = data;
            this.nextUpdate = {};
            
            this.emit("keyStateChanged");
            
            await Fetch.post(`/api/Projects/${this.project}/${this.subproject}/${this.language}/entries`, data, {
                "If-Match": this.etag
            }, result => {
                this.setEtag(result.headers.get("X-Parlance-Hash")!);
            });
            this.updating = false;
            this.submitting = {};
            
            this.emit("keyStateChanged");
            if (Object.keys(this.nextUpdate).length !== 0) {
                await this.pushUpdates();
            }
        } catch (req) {
            this.updating = false;
            this.submitting = {};

            this.emit("keyStateChanged");
            if ((req as WebFetchResponse).status === 412) {
                this.emit("outOfDate");
            } else {
                this.emit("error");
            }
        }
    }
    
    isPending(key: string) {
        return Object.keys(this.nextUpdate).includes(key) || Object.keys(this.submitting).includes(key);
    }
    
    setConflict(key: string, data: TranslationWithPluralType[]) {
        this.conflicts[key] = data;
    }
    
    clearConflict(key: string, resolution: TranslationWithPluralType[]) {
        delete this.conflicts[key];
        this.emit("conflictCleared", key, resolution);
    }
    
    getConflict(key: string): TranslationWithPluralType[] | null {
        return this.conflicts[key];
    }
}

export function useUpdateManager() {
    const {project, subproject, language} = useParams();
    const [updateManager] = useState(new UpdateManager(project!, subproject!, language!));
    return updateManager;
}