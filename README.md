# remote service JavaScript action

this action is used to create a debug session in action,you can set the target what is ssh server or http server.

## Inputs

### `ngrok_token`
auth token from <a href=https://dashboard.ngrok.com/get-started/setup>ngrok<a>
### `ngrok_type`
ssh or http
### `user_passwd`
ssh link password when type match `ssh`

## Outputs

### `link method command`



## Example usage

```yaml
- name: Start Service via Ngrok
    uses: elanworld/remote-action@master
    with:
      ngrok_token : ${{ secrets.NGROK_TOKEN }}
      user_passwd : ${{ secrets.USER_PASS }}
```
