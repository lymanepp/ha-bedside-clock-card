# Publishing checklist

1. Create a public GitHub repository named `bedside-clock-card`.
2. Set a repository description and topics such as `home-assistant`, `hacs`, `lovelace`, and `dashboard`.
3. Push this repository to the default branch.
4. Confirm the **Validate** workflow passes.
5. Run the **Release** workflow with tag `v1.0.0`.
6. In HACS, add the GitHub URL as a custom repository with category **Dashboard**.
7. Install it and confirm HACS creates the resource automatically.
