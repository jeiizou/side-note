export type FileObject = {
    name: string;
    path: string;
    children?: FileObject[];
};
