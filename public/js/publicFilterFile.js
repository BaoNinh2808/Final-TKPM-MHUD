const filter_type = document.getElementById('filter-type');
const filter_date = document.getElementById('filter-created-date');
const filter_owner = document.getElementById('filter-owner');

if (filter_type && filter_date && filter_owner) {
    filter_type.addEventListener('change', function(){
        let type = filter_type.value;
        let date = filter_date.value;
        let owner = filter_owner.value;
        let query = `?type=${type}`;
        if (date) {
            query += `&date=${date}`;
        }
        if (owner) {
            query += `&owner=${owner}`;
        }
        let url = `/public${query}`;
        window.location.href = url;
    });


    filter_owner.addEventListener('change', function(){
        let type = filter_type.value;
        let date = filter_date.value;
        let owner = filter_owner.value;
        let query = `?owner=${owner}`;
        if (type) {
            query += `&type=${type}`;
        }
        if (date) {
            query += `&date=${date}`;
        }
        let url = `/public${query}`;
        window.location.href = url
    }
    );

    filter_date.addEventListener('change', function(){
        let type = filter_type.value;
        let date = filter_date.value;
        let owner = filter_owner.value;
        let query = `?date=${date}`;
        if (type) {
            query += `&type=${type}`;
        }
        if (owner) {
            query += `&owner=${owner}`;
        }
        let url = `/public${query}`;
        window.location.href = url;
    }
    );
}