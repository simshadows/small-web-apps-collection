# Development Diary: Example Kubernetes Application Without Helm

*For background: I spent quite a bit of time beforehand reading key concepts, so I'm coming into this with a bit of useful theoretical knowledge.*

## Attempting (and failing) a pure-WSL1 workflow

I started from scratch in a Windows WSL1 Ubuntu environment.

I started off with trying to install minikube. Using [these instructions](https://minikube.sigs.k8s.io/docs/start/), I ran these commands in WSL:
```
simshadows@kraft tmp$ curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 22.2M  100 22.2M    0     0  8893k      0  0:00:02  0:00:02 --:--:-- 8890k
simshadows@kraft tmp$ sudo dpkg -i minikube_latest_amd64.deb
Selecting previously unselected package minikube.
(Reading database ... 105276 files and directories currently installed.)
Preparing to unpack minikube_latest_amd64.deb ...
Unpacking minikube (1.23.2-0) ...
Setting up minikube (1.23.2-0) ...
simshadows@kraft tmp$ minikube start
😄  minikube v1.23.2 on Ubuntu 20.04
👎  Unable to pick a default driver. Here is what was considered, in preference order:
    ▪ docker: Not installed: exec: "docker": executable file not found in $PATH
    ▪ kvm2: Not installed: exec: "virsh": executable file not found in $PATH
    ▪ podman: Not installed: exec: "podman": executable file not found in $PATH
    ▪ vmware: Not installed: exec: "docker-machine-driver-vmware": executable file not found in $PATH
    ▪ virtualbox: Not installed: unable to find VBoxManage in $PATH

❌  Exiting due to DRV_NOT_DETECTED: No possible driver was detected. Try specifying --driver, or see https://minikube.sigs.k8s.io/docs/start/

```

I need to find a minikube driver. The minikube installation instructions led me [here](https://minikube.sigs.k8s.io/docs/drivers/)

For simplicity, I will use VirtualBox today (`sudo apt-get install virtualbox`), though I'd rather learn how to use KVM.

Unfortunately, it still failed.
```
simshadows@kraft ~$ minikube start --driver=virtualbox
😄  minikube v1.23.2 on Ubuntu 20.04
✨  Using the virtualbox driver based on user configuration
💿  Downloading VM boot image ...
    > minikube-v1.23.1.iso.sha256: 65 B / 65 B [-------------] 100.00% ? p/s 0s
    > minikube-v1.23.1.iso: 225.22 MiB / 225.22 MiB [ 100.00% 11.95 MiB p/s 19s
👍  Starting control plane node minikube in cluster minikube
💾  Downloading Kubernetes v1.22.2 preload ...
    > preloaded-images-k8s-v13-v1...: 511.69 MiB / 511.69 MiB  100.00% 12.72 Mi
🔥  Creating virtualbox VM (CPUs=2, Memory=6000MB, Disk=20000MB) ...
🤦  StartHost failed, but will try again: creating host: create: precreate: We support Virtualbox starting with version 5. Your VirtualBox install is "WARNING: The character device /dev/vboxdrv does not exist.\n\t Please install the virtualbox-dkms package and the appropriate\n\t headers, most likely linux-headers-Microsoft.\n\n\t You will not be able to start VMs until this problem is fixed.\n6.1.26_Ubuntur145957". Please upgrade at https://www.virtualbox.org
🔥  Creating virtualbox VM (CPUs=2, Memory=6000MB, Disk=20000MB) ...
😿  Failed to start virtualbox VM. Running "minikube delete" may fix it: creating host: create: precreate: We support Virtualbox starting with version 5. Your VirtualBox install is "WARNING: The character device /dev/vboxdrv does not exist.\n\t Please install the virtualbox-dkms package and the appropriate\n\t headers, most likely linux-headers-Microsoft.\n\n\t You will not be able to start VMs until this problem is fixed.\n6.1.26_Ubuntur145957". Please upgrade at https://www.virtualbox.org

❌  Exiting due to PR_VBOX_DEVICE_MISSING: Failed to start host: creating host: create: precreate: We support Virtualbox starting with version 5. Your VirtualBox install is "WARNING: The character device /dev/vboxdrv does not exist.\n\t Please install the virtualbox-dkms package and the appropriate\n\t headers, most likely linux-headers-Microsoft.\n\n\t You will not be able to start VMs until this problem is fixed.\n6.1.26_Ubuntur145957". Please upgrade at https://www.virtualbox.org
💡  Suggestion: Reinstall VirtualBox and reboot. Alternatively, try the kvm2 driver: https://minikube.sigs.k8s.io/docs/reference/drivers/kvm2/
🍿  Related issue: https://github.com/kubernetes/minikube/issues/3974

```

I'm not sure how to move forward quickly with working entirely within WSL, so I'll try running minikube natively.

## Attempting a WSL kubectl + native minikube workflow (Success!)

I downloaded a minikube executable [from github](https://github.com/kubernetes/minikube/releases) and ran it (without bothering with PATH variables):
```
PS C:\Users\simshadows\Downloads> .\minikube-windows-amd64.exe start --driver=virtualbox
* minikube v1.23.2 on Microsoft Windows 10 Home 10.0.19043 Build 19043
* Using the virtualbox driver based on user configuration
* Downloading VM boot image ...
    > minikube-v1.23.1.iso.sha256: 65 B / 65 B [-------------] 100.00% ? p/s 0s
    > minikube-v1.23.1.iso: 225.22 MiB / 225.22 MiB [ 100.00% 12.44 MiB p/s 18s
* Starting control plane node minikube in cluster minikube
* Downloading Kubernetes v1.22.2 preload ...
    > preloaded-images-k8s-v13-v1...: 511.69 MiB / 511.69 MiB  100.00% 12.64 Mi
* Creating virtualbox VM (CPUs=2, Memory=6000MB, Disk=20000MB) ...
! This VM is having trouble accessing https://k8s.gcr.io
* To pull new external images, you may need to configure a proxy: https://minikube.sigs.k8s.io/docs/reference/networking/proxy/
* Preparing Kubernetes v1.22.2 on Docker 20.10.8 ...
  - Generating certificates and keys ...
  - Booting up control plane ...
  - Configuring RBAC rules ...
  - Using image gcr.io/k8s-minikube/storage-provisioner:v5
* Enabled addons: storage-provisioner, default-storageclass
* Verifying Kubernetes components...
* kubectl not found. If you need it, try: 'minikube kubectl -- get pods -A'
* Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

*(Note that I already have Virtualbox installed on my Windows host.)*

I also downloaded a kubectl executable and ran it directly in Downloads:
```
PS C:\Users\simshadows\Downloads> .\kubectl.exe get pods -A
NAMESPACE     NAME                               READY   STATUS    RESTARTS       AGE
kube-system   coredns-78fcd69978-xbbzr           1/1     Running   0              113m
kube-system   etcd-minikube                      1/1     Running   0              113m
kube-system   kube-apiserver-minikube            1/1     Running   0              113m
kube-system   kube-controller-manager-minikube   1/1     Running   0              113m
kube-system   kube-proxy-tcvfl                   1/1     Running   0              113m
kube-system   kube-scheduler-minikube            1/1     Running   0              113m
kube-system   storage-provisioner                1/1     Running   1 (113m ago)   113m
```

But interestingly, when I try installing it in WSL and running it, it doesn't work:
```
simshadows@kraft ~$ kubectl get po -A
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

That's very strange! How is it that the native one connects by default while the WSL one fails to connect? Do they just expect different ports?

The solution as it turns out is in how `minikube start` apparently configures kubectl to access it! This was found [here](https://minikube.sigs.k8s.io/docs/handbook/kubectl/):

> By default, kubectl gets configured to access the kubernetes cluster control plane inside minikube when the minikube start command is executed.

What I did was, I printed out the kubectl config on Windows:
```
PS C:\Users\simshadows\Downloads> .\kubectl.exe config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority: C:\Users\simshadows\.minikube\ca.crt
    extensions:
    - extension:
        last-update: Mon, 25 Oct 2021 22:19:43 AEDT
        provider: minikube.sigs.k8s.io
        version: v1.23.2
      name: cluster_info
    server: https://192.168.99.100:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Mon, 25 Oct 2021 22:19:43 AEDT
        provider: minikube.sigs.k8s.io
        version: v1.23.2
      name: context_info
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: C:\Users\simshadows\.minikube\profiles\minikube\client.crt
    client-key: C:\Users\simshadows\.minikube\profiles\minikube\client.key
```

Then, I put those contents into `~/.kube/config` while also fixing up some paths:
```
simshadows@kraft ~$ cat ~/.kube/config 
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /mnt/c/Users/simshadows/.minikube/ca.crt
    extensions:
    - extension:
        last-update: Mon, 25 Oct 2021 22:19:43 AEDT
        provider: minikube.sigs.k8s.io
        version: v1.23.2
      name: cluster_info
    server: https://192.168.99.100:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Mon, 25 Oct 2021 22:19:43 AEDT
        provider: minikube.sigs.k8s.io
        version: v1.23.2
      name: context_info
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: /mnt/c/Users/simshadows/.minikube/profiles/minikube/client.crt
    client-key: /mnt/c/Users/simshadows/.minikube/profiles/minikube/client.key
```

And then I ran the kubectl command from with WSL. It worked!
```
simshadows@kraft ~$ kubectl get pods -A
NAMESPACE     NAME                               READY   STATUS    RESTARTS       AGE
kube-system   coredns-78fcd69978-xbbzr           1/1     Running   0              126m
kube-system   etcd-minikube                      1/1     Running   0              126m
kube-system   kube-apiserver-minikube            1/1     Running   0              126m
kube-system   kube-controller-manager-minikube   1/1     Running   0              126m
kube-system   kube-proxy-tcvfl                   1/1     Running   0              126m
kube-system   kube-scheduler-minikube            1/1     Running   0              126m
kube-system   storage-provisioner                1/1     Running   1 (126m ago)   126m
```

Now, I can begin getting my application working.

## Initial Checks

Before *actually* deploying anything, let's run a few commands.

Running commands in default namespace:
```
simshadows@kraft ~$ kubectl get pods
No resources found in default namespace.
simshadows@kraft ~$ kubectl get deployments
No resources found in default namespace.
simshadows@kraft ~$ kubectl get services
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   165m
simshadows@kraft ~$ kubectl get nodes
NAME       STATUS   ROLES                  AGE    VERSION
minikube   Ready    control-plane,master   166m   v1.22.2
```

Running commands seeing all namespaces:
```
simshadows@kraft ~$ kubectl get pods -A
NAMESPACE     NAME                               READY   STATUS    RESTARTS       AGE
kube-system   coredns-78fcd69978-xbbzr           1/1     Running   0              167m
kube-system   etcd-minikube                      1/1     Running   0              167m
kube-system   kube-apiserver-minikube            1/1     Running   0              167m
kube-system   kube-controller-manager-minikube   1/1     Running   0              167m
kube-system   kube-proxy-tcvfl                   1/1     Running   0              167m
kube-system   kube-scheduler-minikube            1/1     Running   0              167m
kube-system   storage-provisioner                1/1     Running   1 (166m ago)   167m
```

```
simshadows@kraft ~$ kubectl get deployments -A
NAMESPACE     NAME      READY   UP-TO-DATE   AVAILABLE   AGE
kube-system   coredns   1/1     1            1           167m
```

```
simshadows@kraft ~$ kubectl get services -A
NAMESPACE     NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
default       kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP                  167m
kube-system   kube-dns     ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   167m
```

## Deploying Something

Let's start [here](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/).

This website provides us with a sample nginx deployment manifest file:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

*(Random side-note: [This](https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/) also shows us that you can put a bunch of manifests in one file using a `---` separator.)*

I deployed it then inspected it:
```
simshadows@kraft example-kubernetes-without-helm$ kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created
simshadows@kraft example-kubernetes-without-helm$ kubectl get pods -A && kubectl get deployments -A && kubectl get services -A
NAMESPACE     NAME                                READY   STATUS    RESTARTS      AGE
default       nginx-deployment-66b6c48dd5-2v56w   1/1     Running   0             70s
default       nginx-deployment-66b6c48dd5-76s7w   1/1     Running   0             70s
default       nginx-deployment-66b6c48dd5-7c2jm   1/1     Running   0             70s
kube-system   coredns-78fcd69978-xbbzr            1/1     Running   0             10h
kube-system   etcd-minikube                       1/1     Running   0             10h
kube-system   kube-apiserver-minikube             1/1     Running   0             10h
kube-system   kube-controller-manager-minikube    1/1     Running   0             10h
kube-system   kube-proxy-tcvfl                    1/1     Running   0             10h
kube-system   kube-scheduler-minikube             1/1     Running   0             10h
kube-system   storage-provisioner                 1/1     Running   1 (10h ago)   10h
NAMESPACE     NAME               READY   UP-TO-DATE   AVAILABLE   AGE
default       nginx-deployment   3/3     3            3           70s
kube-system   coredns            1/1     1            1           10h
NAMESPACE     NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
default       kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP                  10h
kube-system   kube-dns     ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   10h
```

Looks like we have something in there!

Let's have a look at some logs:
```
simshadows@kraft example-kubernetes-without-helm$ kubectl logs nginx-deployment-66b6c48dd5-2v56w
```

Oh, hmm maybe I'd need to set log level?

I still want to be convinced that something's really in there, so let's open a shell:
```
simshadows@kraft example-kubernetes-without-helm$ kubectl exec --stdin --tty nginx-deployment-66b6c48dd5-2v56w -- /bin/bash
root@nginx-deployment-66b6c48dd5-2v56w:/# ls
bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
root@nginx-deployment-66b6c48dd5-2v56w:/# ls -la etc       
...
drwxr-xr-x 3 root root    4096 Mar 26  2019 nginx
...
root@nginx-deployment-66b6c48dd5-2v56w:/# nginx --help
nginx: invalid option: "-"
root@nginx-deployment-66b6c48dd5-2v56w:/# nginx -h
nginx version: nginx/1.14.2
Usage: nginx [-?hvVtTq] [-s signal] [-c filename] [-p prefix] [-g directives]

Options:
  -?,-h         : this help
  -v            : show version and exit
  -V            : show version and configure options then exit
  -t            : test configuration and exit
  -T            : test configuration, dump it and exit
  -q            : suppress non-error messages during configuration testing
  -s signal     : send signal to a master process: stop, quit, reopen, reload
  -p prefix     : set prefix path (default: /etc/nginx/)
  -c filename   : set configuration file (default: /etc/nginx/nginx.conf)
  -g directives : set global directives out of configuration file

```

So it really does contain nginx files. I feel like I'm fairly convinced this deployment does work as intended.

Though, I'm still not sure how this deployment is getting the container, and how I might inject my own container in.

## Accessing an app from outside the cluster

Some resources I found:

- <https://kubernetes.io/docs/reference/kubernetes-api/service-resources/service-v1/>
    - *Full developer documentation for the `Service` object.*
- <https://kubernetes.io/docs/concepts/services-networking/service/>
    - *More discussion about the `Service` object. Provides useful examples.*
- <https://minikube.sigs.k8s.io/docs/handbook/accessing/>
    - *minikube-specific documentation.*
- <https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/>
    - *Provides a step-by-step. I'm not following it 1:1, but I am using it as a useful reference on what to look into next.*
- <https://kubernetes.io/docs/tutorials/kubernetes-basics/expose/expose-intro/>
    - *High-level discussion, no concrete examples.*

From the resources above, I found the following to be most immediately helpful:

> - `ClusterIP`: Exposes the Service on a cluster-internal IP. Choosing this value makes the Service only reachable from within the cluster. This is the default `ServiceType`.
> - `NodePort`: Exposes the Service on each Node's IP at a static port (the `NodePort`). A `ClusterIP` Service, to which the `NodePort` Service routes, is automatically created. You'll be able to contact the `NodePort` Service, from outside the cluster, by requesting `<NodeIP>:<NodePort>`.

So basically, if we want to assign a group of pods a single IP address, we'd use `ClusterIP`, but then to expose that `ClusterIP` to outside the cluster, we'd need to use `NodePort` as well.

Currently, we only have two services, none of which is nginx-related. Let's somehow fix that and access nginx from our web browser.

Let's start by making a `ClusterIP`.

### Making a `ClusterIP` for in-cluster access

The following example command was provided in the resources above:
```
kubectl expose deployment hello-world --type=LoadBalancer --name=my-service
```

Seems simple enough to just adapt this command for my purposes, but I'd like to instead do it through manifest files.

I first had the thought to try `--dry-run`, but it didn't give me manifests:
```
simshadows@kraft ~$ kubectl expose deployment nginx-deployment --type=ClusterIP --name=nginx-service --dry-run="client"
service/nginx-service exposed (dry run)
simshadows@kraft ~$ kubectl expose deployment nginx-deployment --type=ClusterIP --name=nginx-service --dry-run="server"
service/nginx-service exposed (server dry run)
```

So instead, I started off with having a look at some examples from the references above.

Example 1:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
```

Example 2 shows services defined without selectors. In this case, it seems you'd need to *"manually map the Service to the network address and port where it's running, by adding an Endpoints object manually"*:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
---
apiVersion: v1
kind: Endpoints
metadata:
  name: my-service
subsets:
  - addresses:
      - ip: 192.0.2.42
    ports:
      - port: 9376
```

Let's try this:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

I added it to my manifests file, deployed, and inspected the cluster:
```
simshadows@kraft kubernetes-helloworld-no-helm$ kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment unchanged
service/my-service created
simshadows@kraft kubernetes-helloworld-no-helm$ kubectl get pods -A && kubectl get deployments -A && kubectl get services -A
NAMESPACE     NAME                                READY   STATUS    RESTARTS      AGE
default       nginx-deployment-66b6c48dd5-2v56w   1/1     Running   0             3h11m
default       nginx-deployment-66b6c48dd5-76s7w   1/1     Running   0             3h11m
default       nginx-deployment-66b6c48dd5-7c2jm   1/1     Running   0             3h11m
kube-system   coredns-78fcd69978-xbbzr            1/1     Running   0             13h
kube-system   etcd-minikube                       1/1     Running   0             13h
kube-system   kube-apiserver-minikube             1/1     Running   0             13h
kube-system   kube-controller-manager-minikube    1/1     Running   0             13h
kube-system   kube-proxy-tcvfl                    1/1     Running   0             13h
kube-system   kube-scheduler-minikube             1/1     Running   0             13h
kube-system   storage-provisioner                 1/1     Running   1 (13h ago)   13h
NAMESPACE     NAME               READY   UP-TO-DATE   AVAILABLE   AGE
default       nginx-deployment   3/3     3            3           3h11m
kube-system   coredns            1/1     1            1           13h
NAMESPACE     NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                  AGE
default       kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP                  13h
default       my-service   ClusterIP   10.108.114.121   <none>        80/TCP                   46s
kube-system   kube-dns     ClusterIP   10.96.0.10       <none>        53/UDP,53/TCP,9153/TCP   13h
```

Now, we have a bit of a problem: How do we actually access the port on minikube?

I could manually open up the port using the VirtualBox tools directly, but perhaps there's a better way?

### Having a look at the VirtualBox VM

When we open up the VirtualBox GUI, we can clearly see minikube running:

![VirtualBox main screen.](development-diary-assets/screenshot1-virtualbox-main-screen.png?raw=true "VirtualBox main screen.")

And having a look at the port forwarding screen, we see something exposed:

![VirtualBox port forwarding screen.](development-diary-assets/screenshot2-virtualbox-port-forward-screen.png?raw=true "VirtualBox port forwarding screen.")

*(Side-note: Is this forwarded port in the screenshot for the minikube tool to manage the VM?)*

Let's have a look at it again later after exposing the application.

### Setting up minikube to access the service

I attempted to use this command, which is meant to fetch the minikube IP address and service port:
```
PS C:\Users\simshadows\Downloads> .\minikube-windows-amd64.exe service --url my-service
* service default/my-service has no node port
```

But clearly, I still need to define a `NodePort`.

Let's try changing `my-service` into a `NodePort`, and let's see what happens. New `my-service`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Adding it to the cluster:
```
simshadows@kraft kubernetes-helloworld-no-helm$ kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment unchanged
service/my-service configured
simshadows@kraft kubernetes-helloworld-no-helm$ kubectl get pods -A && kubectl get deployments -A && kubectl get services -A
NAMESPACE     NAME                                READY   STATUS    RESTARTS      AGE
default       nginx-deployment-66b6c48dd5-2v56w   1/1     Running   0             4h36m
default       nginx-deployment-66b6c48dd5-76s7w   1/1     Running   0             4h36m
default       nginx-deployment-66b6c48dd5-7c2jm   1/1     Running   0             4h36m
kube-system   coredns-78fcd69978-xbbzr            1/1     Running   0             14h
kube-system   etcd-minikube                       1/1     Running   0             14h
kube-system   kube-apiserver-minikube             1/1     Running   0             14h
kube-system   kube-controller-manager-minikube    1/1     Running   0             14h
kube-system   kube-proxy-tcvfl                    1/1     Running   0             14h
kube-system   kube-scheduler-minikube             1/1     Running   0             14h
kube-system   storage-provisioner                 1/1     Running   1 (14h ago)   14h
NAMESPACE     NAME               READY   UP-TO-DATE   AVAILABLE   AGE
default       nginx-deployment   3/3     3            3           4h36m
kube-system   coredns            1/1     1            1           14h
NAMESPACE     NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                  AGE
default       kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP                  14h
default       my-service   NodePort    10.108.114.121   <none>        80:31142/TCP             86m
kube-system   kube-dns     ClusterIP   10.96.0.10       <none>        53/UDP,53/TCP,9153/TCP   14h
```

Grabbing the URL off minikube:
```
PS C:\Users\simshadows\Downloads> .\minikube-windows-amd64.exe service --url my-service
http://192.168.99.100:31142
```

Opening it on the web browser:

![Opening the URL in the browser](development-diary-assets/screenshot3-browser-nginx-parking-page.png?raw=true "Opening the URL in the browser")

It works!

Interestingly, I went back to the VirtualBox GUI to look at the NAT port forwarding rules and I don't see any new entries. It must be some other mechanism, but I'm not interested in investigating that quite yet.

## How do we build a container image?














## How do we get a custom image in there?

For this, I found these resources:

- <https://kubernetes.io/docs/concepts/containers/images/>
- <https://minikube.sigs.k8s.io/docs/handbook/pushing/>

Based on this reading, it seems that there are two main parts involved in handling container images:

1) container registries (either public or private/authenticated) to host the images, and
2) the kubelets (node agents) that run on each node, responsible for pulling and storing images for use within the node.

From this, you can provide images in either of two ways:

1) by providing the image on a container registry, or
2) by providing pre-pulled images directly to the kublet.

For our simple example, let's use the pre-pull method.

From the minikube documentation above, we will follow the method titled *Pushing directly to in-cluster CRI-O. (podman-env)*.

First, we run `minikube podman-env` in Windows Powershell:
```
PS C:\Users\simshadows\Downloads> .\minikube-windows-amd64.exe podman-env
$Env:CONTAINER_HOST = "ssh://docker@127.0.0.1:63077/run/podman/podman.sock"
$Env:CONTAINER_SSHKEY = "C:\Users\simshadows\.minikube\machines\minikube\id_rsa"
$Env:MINIKUBE_ACTIVE_PODMAN = "minikube"
# To point your shell to minikube's podman service, run:
# & minikube -p minikube podman-env | Invoke-Expression
```

Let's also have a look at the node to see what container runtime is being used:
```

simshadows@kraft kubernetes-helloworld-no-helm$ kubectl get nodes -o wide
NAME       STATUS   ROLES                  AGE    VERSION   INTERNAL-IP      EXTERNAL-IP   OS-IMAGE              KERNEL-VERSION   CONTAINER-RUNTIME
minikube   Ready    control-plane,master   6d1h   v1.22.2   192.168.99.100   <none>        Buildroot 2021.02.4   4.19.202         docker://20.10.8
```

So clearly, we're using Docker. I don't know 

