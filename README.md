# github remote service linker

by this action,you can connect to github server what run windows,macos,linux.


## Inputs
#### `ngrok_token`

auth token from <a href=https://dashboard.ngrok.com/get-started/setup>ngrok<a>
#### `user_passwd`

set account`s login password
#### `forward_port`

the port you want to use
```markdown
example：
linux ssh: 22
windows remote desktop: 3389
```

## Outputs
`your connection link`



## Example usage
```yaml
- name: Start Service via Ngrok
    uses: elanworld/remote-action@v3.0
    with:
      ngrok_token : ${{ secrets.NGROK_TOKEN }}
      user_passwd : ${{ secrets.USER_PASS }}
```

