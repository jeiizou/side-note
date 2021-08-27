import repoCommand from './repo';
import fileCommand from './file';
import commonCommand from './common';

export default () => {
    repoCommand();
    fileCommand();
    commonCommand();
};
