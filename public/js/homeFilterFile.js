const filter_type = document.getElementById('filter-type');
const filter_date = document.getElementById('filter-created-date');
const filter_public = document.getElementById('filter-public');

if (filter_type && filter_date && filter_public) {
    filter_type.addEventListener('change', function(){
        let type = filter_type.value;
        let date = filter_date.value;
        let public = filter_public.value;
        let query = `?type=${type}`;
        if (date) {
            query += `&date=${date}`;
        }
        if (public) {
            query += `&public=${public}`;
        }
        let url = `/home${query}`;
        window.location.href = url;
    });

    filter_date.addEventListener('change', function(){
        let type = filter_type.value;
        let date = filter_date.value;
        let public = filter_public.value;
        let query = `?date=${date}`;
        if (type) {
            query += `&type=${type}`;
        }
        if (public) {
            query += `&public=${public}`;
        }
        let url = `/home${query}`;
        window.location.href = url;
    });

    filter_public.addEventListener('change', function(){
        let type = filter_type.value;
        let date = filter_date.value;
        let public = filter_public.value;
        let query = `?public=${public}`;
        if (type) {
            query += `&type=${type}`;
        }
        if (date) {
            query += `&date=${date}`;
        }
        let url = `/home${query}`;
        window.location.href = url;
    });
}