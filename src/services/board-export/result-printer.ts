import { BoardExportTaskResult } from "@mirohq/miro-api/dist/api";
import { logger } from "../logger";
import chalk from "chalk";

export function printExportResultList(results: BoardExportTaskResult[]){
    results?.forEach(item => {
        logger.just(chalk.bold(`Board: ${item.boardId}`))
        logger.just(` - ${chalk.bold('Status: ')} ${item.status}`)
        logger.just(` - ${chalk.bold('Details: ')} ${item.errorType ? `${item.errorMessage} (${item.errorType})` : 'N/A'}`)
        logger.just(` - ${chalk.bold('Link: ')} ${item.exportLink}`)
    });
}