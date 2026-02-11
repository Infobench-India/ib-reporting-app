const loadRemoteEntry = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).__remote_loaded__ && (window as any).__remote_loaded__[url]) {
      return resolve()
    }

    const script = document.createElement('script')
    script.src = url
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => {
      if (!(window as any).__remote_loaded__) {
        (window as any).__remote_loaded__ = {}
      }
      (window as any).__remote_loaded__[url] = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load ' + url))
    document.head.appendChild(script)
  })
}

export default { load: loadRemoteEntry }
