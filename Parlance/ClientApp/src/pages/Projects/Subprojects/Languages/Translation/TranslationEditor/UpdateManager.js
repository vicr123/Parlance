import EventEmitter from "eventemitter3";
import Fetch from "../../../../../../helpers/Fetch";
import {useParams} from "react-router-dom";

class UpdateManager extends EventEmitter {
    #nextUpdate;
    #updating;
    
    #project;
    #subproject;
    #language;
    
    constructor(project, subproject, language) {
        super();
        this.#project = project;
        this.#subproject = subproject;
        this.#language = language;
        this.#updating = false;
        this.#nextUpdate = {};
    }
    
    queueForUpdate(key, data) {
        this.#nextUpdate[key] = data;
        this.pushUpdates();
    }
    
    async pushUpdates() {
        if (this.#updating) return;
        this.#updating = true;
        
        try {
            let data = this.#nextUpdate;
            this.#nextUpdate = {};
            
            await Fetch.post(`/api/Projects/${this.#project}/${this.#subproject}/${this.#language}/entries`, {
                
            });
            this.#updating = false;
            if (Object.keys(this.#nextUpdate).length !== 0) {
                await this.pushUpdates();
            }
        } catch {
            this.#updating = false;
        }
    }
}

export function useUpdateManager() {
    const {project, subproject, language} = useParams();
    return new UpdateManager(project, subproject, language);
}