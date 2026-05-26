export class Llm {
    private _roomId: string;

    public constructor(roomId: string) {
        this._roomId = roomId;

    }

    public get roomId(): string {
        return this._roomId;
    }


}