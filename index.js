// import userProductModal from "./userProductModal.js";

// 全部規則
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
  });

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// 套用
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
  });

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'milktea';

const userModal = {
    props: ['tempProduct', 'addToCart'],
    data(){
        return{
            productModal: null,
            qty: 1,
            status: {  
                addCartLoading: '',
            },
        }
    },
    methods:{
        open(){
          this.productModal.show()  
        },
        close(){
          this.productModal.hide();
        },
    },
    watch: { //外面傳來的值產生變化時使用watch
        tempProduct(){
            this.qty = 1;
        }
    },
    template: '#userProductModal',
    mounted(){
        this.productModal = new bootstrap.Modal(this.$refs.modal)
        // this.productModal.show()
    }
}

const app = Vue.createApp({
    data() {
        return {
            products: [],
            tempProduct: {},
            carts: {},
            status: {
                addCartLoading: '',
                cartQtyLoading: '',
                seeMoreLoading: '',
            },
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            },
        };
    },
    methods: {
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then((res) => {
                    this.products = res.data.products;
                })
                .catch((error) => {
                    alert(error.response.data.message);
                })
        },
        openModal(product){
            this.tempProduct = product;
            this.$refs.userModal.open();
            this.status.seeMoreLoading = product.id;
        },
        addToCart(product_id, qty=1){
            const order = {             
                product_id,
                qty,              
            };
            this.status.addCartLoading = product_id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`, {data: order} )
            .then((res) => {
                this.status.addCartLoading = '';
                this.getCart();
                this.$refs.userModal.close();
            });
        },
        changeCartQty(item, qty=1){
            const order = {             
                product_id: item.product_id,
                qty,              
            };
            this.status.cartQtyLoading = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, {data: order} )
            .then((res) => { 
                this.status.cartQtyLoading = '';    
                this.getCart();
            });
        },
        removeCartItem(id){
            this.status.cartQtyLoading = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
            .then((res) => {
                this.status.cartQtyLoading = '';    
                this.getCart();
            });
        },
        deleteAllCarts(){
            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
            .then((res) => {
                this.status.cartQtyLoading = '';    
                this.getCart();
            })
            .catch((err) =>{
                alert(err.response.data.message);
            })
        },
        getCart(){
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
            .then((res) => {
                this.carts = res.data.data;
            });
        },
        onSubmit(){
            const order = this.form;
            axios.post(`${apiUrl}/api/${apiPath}/order`, {data: order})
            .then((res) => {
                alert(res.data.message)
                this.$refs.form.resetForm();
                this.getCart();
            })
            .catch((err) => {
                alert(err.response.data.message);
            });
        },    
    },
    components: {
        userModal,
    },
    mounted() {
        this.getProducts();
        this.getCart();
    },
});
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
// app.use(VueLoading.LoadingPlugin);
app.mount('#app');