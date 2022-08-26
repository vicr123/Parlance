import EventEmitter from "eventemitter3";
import Fetch from "../../../../../../helpers/Fetch";
import {useParams} from "react-router-dom";
import {useState} from "react";

class UpdateManager extends EventEmitter {
    #nextUpdate;
    #updating;
    #submitting;
    
    #project;
    #subproject;
    #language;
    
    #etag;
    
    constructor(project, subproject, language) {
        super();
        this.#project = project;
        this.#subproject = subproject;
        this.#language = language;
        this.#updating = false;
        this.#nextUpdate = {};
        this.#submitting = {};
        this.#etag = "";
    }
    
    queueForUpdate(key, data) {
        this.#nextUpdate[key] = data;
        this.emit("keyStateChanged");
        this.pushUpdates();
    }
    
    setEtag(etag) {
        this.#etag = etag;
    }
    
    async pushUpdates() {
        if (this.#updating) return;
        this.#updating = true;
        
        try {
            let data = this.#nextUpdate;
            this.#submitting = data;
            this.#nextUpdate = {};
            
            this.emit("keyStateChanged");
            
            await Fetch.post(`/api/Projects/${this.#project}/${this.#subproject}/${this.#language}/entries`, data, {
                "If-Match": this.#etag
            }, result => {
                this.setEtag(result.headers.get("ETag"));
            });
            this.#updating = false;
            this.#submitting = {};
            
            this.emit("keyStateChanged");
            if (Object.keys(this.#nextUpdate).length !== 0) {
                await this.pushUpdates();
            }
        } catch (req) {
            this.#updating = false;
            this.#submitting = {};

            this.emit("keyStateChanged");
            if (req.status === 412) {
                this.emit("outOfDate");
            } else {
                this.emit("error");
            }
        }
    }
    
    isPending(key) {
        return Object.keys(this.#nextUpdate).includes(key) || Object.keys(this.#submitting).includes(key);
    }
}

export function useUpdateManager() {
    const {project, subproject, language} = useParams();
    const [updateManager] = useState(new UpdateManager(project, subproject, language));
    return updateManager;
}