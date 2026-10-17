import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { serverEvents } from "@tiddlywiki/events";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

serverEvents.on("cli.register", (commands) => {
	commands[info.name] = { info, Command: SetAdminPasswordCommand };
});

const info: CommandInfo = {
	name: "set-admin-password",
	description: "Set the admin password in case you get locked out.",
	arguments: [],
	options: [
		["username <string>", "Reset the password of a specific ADMIN user (default: admin)"]
	]
};


export class SetAdminPasswordCommand extends BaseCommand<[], {
	username?: [string];
}> {
	static info = info;

	async execute(): Promise<any> {
		const username = this.options.username?.[0] ?? "admin";
		console.log("Username:", username);
		const input = await this.getPassword();
		await this.config.engine.$transaction(async prisma => {
			const admin = await prisma.users.findUniqueOrThrow({
				where: { username, roles: { some: { role_name: "ADMIN" } } }
			}).catch(() => {
				throw "The ADMIN user '" + username + "' could not be found.";
			});

			const password = await this.config.PasswordService.PasswordCreation(admin.user_id, input);

			await prisma.users.update({ where: { user_id: admin.user_id }, data: { password: password }, });

		});
	}

	async getPassword(): Promise<string> {
		if (!process.stdin.isTTY) {
			return (await this.readStdin()).replace(/\r?\n$/, "");
		}

		const wasRaw = process.stdin.isRaw;
		const wasPaused = process.stdin.isPaused();
		const output = new Writable({
			write(_chunk, _encoding, callback) { callback(); },
		});
		const readline = createInterface({
			input: process.stdin,
			output,
			terminal: true,
			historySize: 0,
		});

		try {
			process.stderr.write("Password: ");
			return await new Promise<string>((resolve, reject) => {
				readline.once("close", () => reject("Password entry cancelled."));
				readline.once("SIGINT", () => readline.close());
				readline.question("", resolve);
			});
		} finally {
			readline.close();
			process.stdin.setRawMode(wasRaw);
			if (wasPaused) process.stdin.pause();
			output.destroy();
			process.stderr.write("\n");
		}
	}

	async readStdin(): Promise<string> {
		process.stdin.setEncoding("utf8");
		let input = "";

		for await (const chunk of process.stdin) {
			input += chunk;
		}

		return input;
	}

}

