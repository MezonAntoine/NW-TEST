import { execSync } from "child_process";

module.exports = async () => {
    try {
        execSync("docker-compose -f ./docker-compose.test.yml up -d");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        execSync("dotenv -e .env.test -- prisma migrate dev");
    } catch (error) {
        console.error("Error starting Docker containers:", error);
        process.exit(1);
    }
};
