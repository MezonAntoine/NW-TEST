import { execSync } from "child_process";

module.exports = async () => {
    try {
        execSync("docker rm --force database_test");
    } catch (error) {
        process.exit(1);
    }
};
