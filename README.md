# Miro CLI

![Release Workflow](https://github.com/davitp/mirocli/actions/workflows/release.yml/badge.svg) ![NPM Version](https://img.shields.io/npm/v/mirocli)

Miro CLI is a robust command-line interface (CLI) tool designed for working with the Miro Platform API. It enables users to view and manage their boards, teams, and resources, as well as access enterprise features such as Content Logs, Board Export, and Audit Logs. 

The tool securely manages app credentials and sessions, ensuring safe and convenient access to Miro's powerful API capabilities. By leveraging Miro CLI, teams and developers can streamline workflows, automate tasks, and gain deeper insights into their Miro environments—all from the comfort of the command line.

## Introduction

Miro CLI allows developers and teams to interact with Miro's RESTful APIs ([developers.miro.com](https://developers.miro.com/docs/miro-rest-api-introduction)) directly from the command line.  
With Miro CLI, you can:  
- View and manage boards, teams, and resources.  
- Access enterprise-level features such as Content Logs, Board Export, and Audit Logs.  
- Securely manage credentials and maintain session persistence for seamless access.  

By integrating Miro CLI into your development and operational workflows, you can automate and simplify tasks that would otherwise require manual interaction through the Miro web interface.

For more information on Miro's API capabilities, refer to the [Miro REST API Introduction](https://developers.miro.com/docs/miro-rest-api-introduction).

## Installation

### Prerequisites

- **Node.js**: Ensure that Node.js is installed on your system. You can download it from the [official website](https://nodejs.org/).

- **(Linux only) libsecret**: For Linux systems, make sure `libsecret` is installed. This library is required for securely storing credentials. Install it using your system's package manager:

  - **Debian/Ubuntu**:

    ```bash
    sudo apt install libsecret-1-dev
    ```

  - **Fedora**:

    ```bash
    sudo dnf install libsecret-devel
    ```

  - **Arch Linux**:

    ```bash
    sudo pacman -S libsecret
    ```

### Install via npm

To install Miro CLI globally using npm, run the following command:

```bash
npm install -g mirocli
```

This command will make the `mirocli` command available globally on your system. Once installed, you can verify the installation by running:

```bash
mirocli --help
```

This will display the help information, confirming that the installation was successful.

## Install from Source

### Prerequisites for Source Installation

- **pnpm**: Ensure `pnpm` is installed globally on your system. If not, install it using npm:

```bash
npm install -g pnpm
```

### Steps to Install from Source

To install Miro CLI from the source code, follow these steps:

1. Clone the repository from GitHub.  
2. Install dependencies using `pnpm`.  
3. Build the project.  
4. Link the CLI globally for system-wide use.

Run the following commands:

```bash
git clone https://github.com/davitp/mirocli.git
cd mirocli
pnpm i
pnpm build
pnpm link --global
```

After completing these steps, you can verify the installation by running:

```bash
mirocli --help
```

This will display the help information for Miro CLI, confirming that the installation was successful.

## Getting Started

To use Miro CLI, you need to configure at least one **context**, which represents a registered Miro app (client). A context stores the credentials and details required to interact with the Miro API.

### Adding a Context

You can add a new context using the following command:

```bash
mirocli context add
```

The interactive prompt will guide you through the configuration process. Below is an example of the prompt and the expected inputs:

```
? How do you want to call the new context? (Default value: default) default
? Which organization do you want to use? [Enter your organization ID] 1234567890
? What is your app's client ID? **********
? What is your app's client secret? ******
```

Once you've completed the prompts, the context will be saved, and you can start using Miro CLI commands to interact with your Miro resources.

## Login

To authenticate with the Miro Platform, use the following command:

```bash
mirocli auth login
```

This will open your default web browser to complete the authentication process. Log in using your Miro account, and once successful, simply close the browser window.

### Verifying Login

After completing the login process, you can verify your authentication status by running:

```bash
mirocli auth whoami
```

This command will display information about the authenticated user, such as the user's name and organization associated with the current session.

With successful authentication, you're ready to use Miro CLI to manage your Miro resources and access its features.

## Examples

Here are some common examples of how to use Miro CLI:

### View the Current Organization

To view the details of the current organization, use:

```bash
mirocli organization view
```

### Search for Teams

To search for teams within the organization, use:

```bash
# display results in table view
mirocli teams list --name "Marketing"

# display results in raw json
mirocli teams list --name "Marketing" --json
```

This will list the teams whose names match the filter "Marketing."

## More Information

For more details on available commands and their usage, you can always run:

```bash
mirocli help
```

This will provide an overview of all commands, options, and flags that Miro CLI supports. Additionally, you can get help for specific commands by using:

```bash
mirocli <command> --help
```

This will show detailed information about that particular command, including available options and usage examples.
