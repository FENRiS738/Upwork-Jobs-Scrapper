<h1>Steps to follow for Deploying this to cloud run</h1>
<ul>
    <li>
    <h4>Step: 1</h4>
    <p>Create a docker file with proper conifguration.</p>
    </li>
    <li>
    <h4>Step: 2</h4>
    <p>Authentication on gcloud sdk using command <br/><code>gcloud auth login</code>
    </p>
    </li>
    <li>
    <h4>Step: 3</h4>
    <p>Enable google cloud run services through command line<br/>
    <code>
    gcloud services enable artifactregistry.googleapis.com
    </code>
    <br/>
    <code>
    gcloud services enable run.googleapis.com
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 4</h4>
    <p>Authenticate and configure docker to google cloud run using this commands<br/>
    <code>
    gcloud auth configure-docker
    </code>
    <br/>
    <code>
    gcloud auth configure-docker us-docker.pkg.dev
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 5</h4>
    <p>Build docker image of your registry on google cloud run within your project<br/>
    <code>
    docker build -t gcr.io/{{project-id}}/{{application-name}} .
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 6</h4>
    <p>Push docker image of your registry on google cloud run within your project<br/>
    <code>
    docker push gcr.io/{{project-id}}/{{application-name}} .
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 7</h4>
    <p>Run your registry on google cloud run within your project with default settings<br/>
    <code>
    gcloud run deploy {{application-name}} --image gcr.io/{{project-id}}/{{application-name}}     --platform managed     --region us-central1     --allow-unauthenticated
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 8 (Optional)</h4>
    <p>If you ever want to increase memory limit of your registry on google cloud run within your project<br/>
    <code>
    gcloud run services update upwork-scraper-stob     --memory=1Gi     --region=us-central1
    </code>
    </p>
    </li>
</ul>

<hr/>

<h1>Steps to follow for Removing this from cloud run</h1>
<ul>
    <li>
    <h4>Step: 1</h4>
    <p>Delete the service from cloud run<br>
    <code>
    gcloud run services delete upwork-scraper-stob --region=us-central1
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 2</h4>
    <p>Check if any image available<br/>
    <code>
    gcloud container images list
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 3</h4>
    <p>Delete the image container<br/>
    <code>
    gcloud container images delete gcr.io/upwork-scrapper-452208/upwork-scraper-stob --force-delete-tags
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 4</h4>
    <p>Disable google cloud apis<br/>
    <code>
    gcloud services disable run.googleapis.com  artifactregistry.googleapis.com
    </code>
    </p>
    </li>
    <li>
    <h4>Step: 5</h4>
    <p>Unlink the billing account from the project.
    </p>
    </li>
</ul>
