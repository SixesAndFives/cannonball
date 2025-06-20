declare module 'backblaze-b2' {
  export class B2 {
    constructor(options: { applicationKeyId: string; applicationKey: string })
    authorize(): Promise<any>
    getUploadUrl(options: { bucketId: string }): Promise<any>
    uploadFile(options: {
      uploadUrl: string
      uploadAuthToken: string
      fileName: string
      data: Buffer
      contentType?: string
      contentLength?: number
    }): Promise<any>
  }
}
