const placeholdersRegex = /\?+/g;
const str = 'icdnscbs?mcdio??cdnmkcc?cdcdc'
while (1) {
  let res = placeholdersRegex.exec(str)
  if (!res) break
  console.log(res)
}

