# Project photos

Add one landscape photo per project (about 1600px wide, JPG/WebP), then in the Projects section of `index.html`
replace the `project-media--placeholder` block with:

    <div class="project-media"><img src="assets/projects/your-photo.jpg" alt="Describe the space" loading="lazy"></div>

Set `data-category="residential"` or `"commercial"` on each project so the filter works.
