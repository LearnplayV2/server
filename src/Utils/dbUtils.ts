class DBUtils {

    static mysqlEscape(stringToEscape: string) {
        if(stringToEscape == '') {
            return stringToEscape;
        }
    
        return stringToEscape
            .replace(/\\/g, "\\\\")
            .replace(/\'/g, "\\\'")
            .replace(/\"/g, "\\\"")
            .replace(/\n/g, "\\\n")
            .replace(/\r/g, "\\\r")
            .replace(/\x00/g, "\\\x00")
            .replace(/\x1a/g, "\\\x1a");
    }
    
}

export default DBUtils